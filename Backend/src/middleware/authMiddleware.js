const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const BlacklistedToken = require('../models/blacklistedToken.model');

exports.protect = async(req, res, next) => {
    let token;

    // 1. Extract token from cookies (accessToken first, then fallback to jwt)
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // 2. Fallback to Authorization header (Bearer)
    else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.toLowerCase().startsWith('bearer')) {
            token = authHeader.split(' ')[1];
        } else {
            token = authHeader;
        }
    }

    if(!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        // 3. Check if token is blacklisted
        const isBlacklisted = await BlacklistedToken.exists({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Not authorized, session has been revoked' });
        }

        // 4. Verify token cryptographically
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // 5. CSRF Protection for state-modifying requests
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const origin = req.headers.origin;
            const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
            // If the browser sends an Origin header, check if it matches our allowed origins list
            if (origin && !allowedOrigins.includes(origin)) {
                return res.status(403).json({ message: 'Forbidden: Cross-Site Request Forgery (CSRF) check failed' });
            }
        }

        next();
    } catch(error) {
        return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
};

// Role Authorization (Checking if they have the right rank)
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role (${req.user.role}) is not authorized to access this resource` })
        }
        next();
    };
};

/**
 * @description Admin Bouncer - Must be used AFTER the protect middleware
 */
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin God Mode required." })
    }
};