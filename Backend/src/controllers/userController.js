const User = require('../models/user.model');
const cloudinary = require('../config/cloudinary');

/**
 * @description Update use profile (BIO, Skills, Profile Picture)
 * @route PUT /api/users/profile
 * @access Private (Require Token)
 */
exports.updateProfile = async (req, res) => {
  try {
    //req.user comes from our protect middleware!
    const {
      firstName,
      lastName,
      bio,
      skills,
      professionalHeadline,
      primaryRole,
      experienceLevel,
      techStackTags,
      links,
      education,
      mobileNumber,
    } = req.body;

    let profilePictureUrl = req.user.profilePicture;

    if (req.file) {
      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'hackflow_profiles',
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(req.file.buffer);
        });
      const result = await uploadStream();
      profilePictureUrl = result.secure_url;
    }

    let parsedSkills = req.user.skills;
    if (skills) {
      parsedSkills = Array.isArray(skills)
        ? skills
        : skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean);
    }

    let parsedTechStack = req.user.techStackTags;
    if (techStackTags) {
      let tempTechStack = techStackTags;
      if (typeof techStackTags === 'string' && techStackTags.startsWith('[')) {
        try {
          tempTechStack = JSON.parse(techStackTags);
        } catch (e) {
          tempTechStack = techStackTags;
        }
      }
      parsedTechStack = Array.isArray(tempTechStack)
        ? tempTechStack
        : typeof tempTechStack === 'string'
          ? tempTechStack
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : req.user.techStackTags;
    }

    let incomingLinks = links;
    if (typeof links === 'string') {
      try {
        incomingLinks = JSON.parse(links);
      } catch (e) {
        incomingLinks = {};
      }
    }

    let incomingEducation = education;
    if (typeof education === 'string') {
      try {
        incomingEducation = JSON.parse(education);
      } catch (e) {
        incomingEducation = {};
      }
    }

    // Deep merge or update links/education object safely
    const updatedLinks = {
      githubUrl:
        incomingLinks?.githubUrl !== undefined
          ? incomingLinks.githubUrl
          : req.user.links?.githubUrl,
      linkedinUrl:
        incomingLinks?.linkedinUrl !== undefined
          ? incomingLinks.linkedinUrl
          : req.user.links?.linkedinUrl,
      leetcodeUrl:
        incomingLinks?.leetcodeUrl !== undefined
          ? incomingLinks.leetcodeUrl
          : req.user.links?.leetcodeUrl,
      codeforcesUrl:
        incomingLinks?.codeforcesUrl !== undefined
          ? incomingLinks.codeforcesUrl
          : req.user.links?.codeforcesUrl,
      portfolioUrl:
        incomingLinks?.portfolioUrl !== undefined
          ? incomingLinks.portfolioUrl
          : req.user.links?.portfolioUrl,
    };

    const updatedEducation = {
      university:
        incomingEducation?.university !== undefined
          ? incomingEducation.university
          : req.user.education?.university,
      graduationYear:
        incomingEducation?.graduationYear !== undefined
          ? Number(incomingEducation.graduationYear)
          : req.user.education?.graduationYear,
      degree:
        incomingEducation?.degree !== undefined
          ? incomingEducation.degree
          : req.user.education?.degree,
    };

    let isMobileVerified = req.user.isMobileVerified;
    let mobileVerificationOtp = req.user.mobileVerificationOtp;
    let mobileOtpExpires = req.user.mobileOtpExpires;
    let mockOtp = null;

    if (mobileNumber !== undefined && mobileNumber !== req.user.mobileNumber) {
      isMobileVerified = false;
      if (mobileNumber) {
        mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
        mobileVerificationOtp = mockOtp;
        mobileOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        console.log(`[SMS MOCK] Send OTP ${mockOtp} to mobile ${mobileNumber}`);
      } else {
        mobileVerificationOtp = undefined;
        mobileOtpExpires = undefined;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        bio: bio !== undefined ? bio : req.user.bio,
        skills: parsedSkills,
        profilePicture: profilePictureUrl,
        professionalHeadline:
          professionalHeadline !== undefined ? professionalHeadline : req.user.professionalHeadline,
        primaryRole: primaryRole || req.user.primaryRole,
        experienceLevel: experienceLevel || req.user.experienceLevel,
        techStackTags: parsedTechStack,
        links: updatedLinks,
        education: updatedEducation,
        mobileNumber: mobileNumber !== undefined ? mobileNumber : req.user.mobileNumber,
        isMobileVerified,
        mobileVerificationOtp,
        mobileOtpExpires,
      },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationOtp -otpExpires');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
      mockOtp, // Returned for testing purposes in client
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Get a public user profile by username
 * @route GET /api/users/profile/:username
 * @access Public
 */
exports.getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const userProfile = await User.findOne({ username }).select(
      '-password -emailVerificationOtp -otpExpires -resetPasswordToken -resetPasswordExpires'
    );
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: userProfile,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.verifyMobileOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isMobileVerified)
      return res.status(400).json({ message: 'Mobile number already verified' });
    if (!user.mobileNumber)
      return res.status(400).json({ message: 'Please add a mobile number first.' });

    if (user.mobileVerificationOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.mobileOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    user.isMobileVerified = true;
    user.mobileVerificationOtp = undefined;
    user.mobileOtpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Mobile number verified successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.resendMobileOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.mobileNumber)
      return res.status(400).json({ message: 'Please add a mobile number first.' });

    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.mobileVerificationOtp = mockOtp;
    user.mobileOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.isMobileVerified = false;
    await user.save();

    console.log(`[SMS MOCK] Resend OTP ${mockOtp} to mobile ${user.mobileNumber}`);

    res.status(200).json({ message: 'OTP resent successfully!', mockOtp });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
