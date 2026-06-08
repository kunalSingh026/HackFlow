const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    //Name Fields
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [ 'participant', 'judge' , 'admin' ],
        default: 'participant'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        maxLength: 300,
        default: ""
    },
    skills: [{ type: String }],
    profilePicture: {
        type: String,
        default: ""
    },
    professionalHeadline: {
        type: String,
        maxLength: 150,
        default: ""
    },
    primaryRole: {
        type: String,
        enum: ['Full Stack', 'Frontend', 'Backend', 'UI/UX', 'AI/ML', 'Cybersecurity', 'Other'],
        default: 'Full Stack'
    },
    experienceLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Intermediate'
    },
    techStackTags: [{
        type: String,
        trim: true
    }],
    links: {
        githubUrl: { type: String, default: "" },
        linkedinUrl: { type: String, default: "" },
        leetcodeUrl: { type: String, default: "" },
        codeforcesUrl: { type: String, default: "" },
        portfolioUrl: { type: String, default: "" }
    },
    education: {
        university: { type: String, default: "" },
        graduationYear: { type: Number },
        degree: { type: String, default: "" }
    },
    badges: [{
        type: String
    }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOtp: { type: String },
    otpExpires: { type: Date },
    mobileNumber: { type: String, default: "" },
    isMobileVerified: { type: Boolean, default: false },
    mobileVerificationOtp: { type: String },
    mobileOtpExpires: { type: Date }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        return resetToken;
};

module.exports = mongoose.model('User', UserSchema);