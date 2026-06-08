import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'participant',
  });

  const [otp, setOtp] = useState('');
  const [verificationStep, setVerificationStep] = useState('register'); // 'register' or 'otp'
  const [verificationEmail, setVerificationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setVerificationEmail(formData.email);
      setVerificationStep('otp');
      setSuccessMessage(res.data.message || 'Registration successful! Please check your email for the OTP.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email', {
        email: verificationEmail,
        otp: otp,
      });

      setSuccessMessage(res.data.message || 'Email verified successfully! You can now log in.');
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationStep === 'otp') {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#f7f6f0]">
            Verify your <span className="text-[#afacca]">Email.</span>
          </h1>
          <p className="text-xs text-[#afacca] mt-1">We have sent a 6-digit OTP code to {verificationEmail}</p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-2.5 text-center mb-3.5">
            {successMessage}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3.5">
          {/* OTP Input */}
          <div className="flex flex-col">
            <label className="field-label">One-Time Password (OTP)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#afacca]/50 flex items-center pointer-events-none">
                <ShieldCheck size={14} />
              </span>
              <input
                type="text"
                name="otp"
                placeholder="123456"
                value={otp}
                onChange={handleOtpChange}
                required
                maxLength={6}
                className="input-field w-full !pl-9 text-xs tracking-widest text-center font-bold"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg p-2 text-center">
              {error}
            </p>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3.5 mt-1 rounded-xl premium-glow-button font-display text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Switch */}
        <p className="text-center mt-5 text-xs text-[#afacca]/50">
          Didn't receive the code?{' '}
          <button
            type="button"
            className="font-semibold text-[#f7f6f0] underline transition-colors hover:text-[#afacca] cursor-pointer bg-transparent border-none p-0"
            onClick={() => setVerificationStep('register')}
          >
            Back to registration
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#f7f6f0]">
          Join <span className="text-[#afacca]">HackFlow.</span>
        </h1>
        <p className="text-xs text-[#afacca] mt-1">Create a secure builder account today.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="field-label">First Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#afacca]/50 flex items-center pointer-events-none">
                <User size={14} />
              </span>
              <input
                type="text"
                name="firstName"
                placeholder="Aryan"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="input-field w-full !pl-9 text-xs"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="field-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Sharma"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="input-field w-full text-xs"
            />
          </div>
        </div>

        {/* Username */}
        <div className="flex flex-col">
          <label className="field-label">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#afacca]/50 flex items-center pointer-events-none">
              <User size={14} />
            </span>
            <input
              type="text"
              name="username"
              placeholder="aryansharma"
              value={formData.username}
              onChange={handleChange}
              required
              className="input-field w-full !pl-9 text-xs"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="field-label">Email Address</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#afacca]/50 flex items-center pointer-events-none">
              <Mail size={14} />
            </span>
            <input
              type="email"
              name="email"
              placeholder="you@hackflow.dev"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field w-full !pl-9 text-xs"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="field-label">Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#afacca]/50 flex items-center pointer-events-none">
              <Lock size={14} />
            </span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field w-full !pl-9 text-xs"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col">
          <label className="field-label">Confirm Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#afacca]/50 flex items-center pointer-events-none">
              <Lock size={14} />
            </span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="input-field w-full !pl-9 text-xs"
            />
          </div>
        </div>

        {/* Purpose / Role Selection */}
        <div className="flex flex-col">
          <label className="field-label">How will you use HackFlow?</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="input-field w-full text-xs bg-[#08070d]"
          >
            <option value="participant">I want to participate in hackathons</option>
            <option value="admin">I want to host and manage events</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg p-2 text-center">
            {error}
          </p>
        )}

        {/* Submit */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3.5 mt-1 rounded-xl premium-glow-button font-display text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Account'}
          <ArrowRight size={15} />
        </button>
      </form>

      {/* Switch */}
      <p className="text-center mt-5 text-xs text-[#afacca]/50">
        Already have an account?{' '}
        <button
          type="button"
          className="font-semibold text-[#f7f6f0] underline transition-colors hover:text-[#afacca] cursor-pointer bg-transparent border-none p-0"
          onClick={onSwitchToLogin}
        >
          Log in here
        </button>
      </p>
    </div>
  );
};

export default Register;