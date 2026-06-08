const User = require('../models/user.model');
const Team = require('../models/team.model');
const Registration = require('../models/registration.model');
const Event = require('../models/event.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

/**
 * @description Register a new participant and send OTP
 * @route POST /api/auth/register
 */

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, role } = req.body;

        // Validate role to prevent arbitrary escalation, limiting to standard admin or participant roles
        const assignedRole = role === 'admin' ? 'admin' : 'participant';

        // checking is user already exists
        let userExists = await User.findOne({
            $or: [{
                email
            }, {
                username
            }]
        });
        if (userExists) {
            return res.status(400).json({
                message: 'User already exists with this email or username'
            })
        }

        //hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a 6-digit OTP and set expiration (10 mins)
        const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresTime = new Date(Date.now() + 10 * 60 * 1000);

        const user = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            role: assignedRole,
            emailVerificationOtp: generateOtp,
            otpExpires: otpExpiresTime
        });
        
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your HackFlow Account',
                otp: generateOtp
            });
            res.status(201).json({
                message: 'Registration successful! Please check your email for the OTP.'
            });
        } catch (emailError) {
            // Rollback: delete the user if email failed to send
            await User.findByIdAndDelete(user._id);
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                message: 'Failed to send OTP email. Please ensure the server is configured with a valid Gmail App Password.',
                error: emailError.message
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @desc Verify Email with OTP
 * @route POST /api/auth/verify-email
 */
exports.verifyEmail = async(req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if(!user) return res.status(404).json({ message: 'User not found' });
        if(user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

        //Check if OTP matches and is not expired
        if (user.emailVerificationOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check if OTP is not expired
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' })
        }

        // Verification successful! Update DB
        user.isEmailVerified = true;
        user.emailVerificationOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @description Authentication user & get token
 * @route Post /api/auth/login
 */

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: 'Email or password is incorrect' });
        }

        if(!user.isEmailVerified) {
            return res.status(400).json({
                message: 'Please verify your email before logging in.'
            })
        }

        if (user.isBanned) {
            return res.status(403).json({
                message: "Your account has been suspended by an admininstrator for violating platform guidelines."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({
                message: 'Invaid email or password'
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } //Token last for 7 days
        );

        const isHost = await Event.exists({ organizer: user._id });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax'
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isHost: !!isHost,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * @description Generate a reset token and email it to the user
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "There is no user with that email address." });
        }

        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        const message = `<h1>You have requested a password reset</h1>
            <p>Please click on the following link to reset your password. This link is valid for 10 minutes.</p>
            <a href="${resetUrl}" target="_blank">${resetUrl}</a>
            <p>If you did not request this, please ignore this email.</p>`;

        console.log(`RESET URL: ${resetUrl}`);

        res.status(200).json({ message: "Password reset email sent." });
    } catch (error) {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
        res.status(500).json({ message: "Email could not be sent.", error: error.message });
    }
};

/**
 * @description Reset passwordd using the email token
 * @route PUT /api/auth/reset-password/:resetToken
 * @access Public
 */
exports.resetPassword = async (req, res) => {
    try {
        // 1. Get the hashed version of the token sent in the URL
        // We must hash it because we only saved the HASHED version in the database!
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        // 2. Find the user with this matching token AND ensure the token hasn't expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() } // $gt means "Greater Than" right now
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        // 3. Update the password
        // Hash the password securely as the User model does not actually have a pre-save hook for password hashing
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // 4. Clear the token fields so they can't be used again
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password has been successfully reset." });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/**
 * @description Delete user account and cascade delete associated data
 * @route DELETE /api/auth/delete-account
 * @access Private
 */
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const ledTeams = await Team.find({ leader: userId });
        if (ledTeams.length > 0) {
            return res.status(400).json({
                message: "You cannot delete your account while you are the captain of an active team. Please disband your team first."
            });
        }
        await Team.updateMany(
            { members: userId },
            { $pull: { members: userId } }
        );
        await Team.updateMany(
            { pendingRequests: userId },
            { $pull: { pendingRequests: userId } }
        );
        await Team.updateMany(
            { invitedUsers: userId },
            { $pull: { invitedUsers: userId } }
        );

        await Registration.deleteMany({ user: userId });

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "Account and all associated data have been permanently deleted." });
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

/**
 * @description Log user out (Stateless JWT)
 * @route POST /api/auth/logout
 * @access Public
 */
exports.logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'lax'
    });
    res.status(200).json({ 
        message: "Logged out successfully." 
    });
};

/**
 * @description Get current logged in user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isHost = await Event.exists({ organizer: user._id });

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                isHost: !!isHost,
                profilePicture: user.profilePicture,
                mobileNumber: user.mobileNumber,
                isMobileVerified: user.isMobileVerified
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};