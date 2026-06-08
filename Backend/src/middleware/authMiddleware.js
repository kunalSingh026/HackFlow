const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user.model');

exports.protect = async(req, res, next) => {
    let token;

    // Checking if token is in cookies
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // Checking if the token is passed in the "Authorization" header
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
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