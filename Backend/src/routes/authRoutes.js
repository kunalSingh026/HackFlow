const express = require('express');
const router = express.Router();
const { registerUser, verifyEmail, loginUser, forgotPassword, resetPassword, deleteAccount, logoutUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.delete('/delete-account', protect, deleteAccount);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
module.exports = router;