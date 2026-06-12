const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  deleteAccount,
  logoutUser,
  getMe,
  refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.delete('/delete-account', protect, deleteAccount);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
module.exports = router;
