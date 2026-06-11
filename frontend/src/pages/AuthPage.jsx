import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  // Sync state with URL path
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [location.pathname]);

  const flipToRegister = () => navigate('/register');
  const flipToLogin = () => navigate('/login');

  return (
    <div className="auth-universe">
      {/* Refined Ambient Glows */}
      <div className="ambient-glow glow-top-right" />
      <div className="ambient-glow glow-bottom-left" />

      <div className="auth-scene">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#595388] shadow-md shadow-[#595388]/30">
              <Layers size={18} className="text-[#f7f6f0]" />
            </div>
            <span className="font-display text-lg font-bold tracking-widest text-[#f7f6f0]">
              HACK<span className="text-[#afacca]">.</span>FLOW
            </span>
          </Link>
        </motion.div>

        {/* Flip Card */}
        <motion.div
          className="flip-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
            {/* Front — Login */}
            <div className="card-face card-front">
              <Login onSwitchToRegister={flipToRegister} />
            </div>

            {/* Back — Register */}
            <div className="card-face card-back">
              <Register onSwitchToLogin={flipToLogin} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
