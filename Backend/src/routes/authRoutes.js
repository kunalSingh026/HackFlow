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
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validateMiddleware');

router.post('/register', validateRegister, registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resetToken', validateResetPassword, resetPassword);
router.delete('/delete-account', protect, deleteAccount);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);
module.exports = router;
