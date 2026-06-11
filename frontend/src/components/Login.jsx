import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to log in.');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#f7f6f0]">
          Welcome <span className="text-[#afacca]">Back.</span>
        </h1>
        <p className="text-xs text-[#afacca] mt-1">Log in to continue building your vision.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col">
          <label className="field-label">Email Address</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#afacca]/50 flex items-center pointer-events-none">
              <Mail size={16} />
            </span>
            <input
              type="email"
              name="email"
              placeholder="you@hackflow.dev"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field w-full !pl-10"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="field-label">Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#afacca]/50 flex items-center pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field w-full !pl-10"
            />
          </div>
        </div>
        {/* Error Message Display */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg p-2 text-center mt-2 mb-2">
            {error}
          </div>
        )}

        {/* Forgot Password */}
        <div className="flex justify-end -mt-1">
          <a
            href="#"
            className="text-xs text-[#afacca]/60 no-underline transition-colors hover:text-[#f7f6f0]"
          >
            Forgot your password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 py-3.5 mt-2 rounded-xl premium-glow-button font-display text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Log In
          <LogIn size={15} />
        </button>
      </form>

      {/* Switch */}
      <p className="text-center mt-6 text-xs text-[#afacca]/50">
        No account yet?{' '}
        <button
          type="button"
          className="font-semibold text-[#f7f6f0] underline transition-colors hover:text-[#afacca] cursor-pointer bg-transparent border-none p-0"
          onClick={onSwitchToRegister}
        >
          Register here
        </button>
      </p>
    </div>
  );
};

export default Login;
