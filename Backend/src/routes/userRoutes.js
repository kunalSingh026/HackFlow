const express = require('express');
const router = express.Router();
const { updateProfile, getProfileByUsername, verifyMobileOtp, resendMobileOtp } = require('../controllers/userController');

//Import por  middlewares
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Look how clean this is!
// 1. User must be logged in (protect)
// 2. Look for a single file named 'profilepicture' (upload.single)
// 3. Run the update logic (updateProfile)
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.get('/profile/:username', getProfileByUsername);
router.post('/verify-mobile', protect, verifyMobileOtp);
router.post('/resend-mobile-otp', protect, resendMobileOtp);

module.exports = router;