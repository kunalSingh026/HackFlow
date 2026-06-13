const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test') });

const User = require('./src/models/user.model');
const RefreshToken = require('./src/models/refreshToken.model');
const BlacklistedToken = require('./src/models/blacklistedToken.model');
const authController = require('./src/controllers/authController');
const authMiddleware = require('./src/middleware/authMiddleware');

async function runTests() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // Clean up any existing test user / tokens
    const testEmail = 'test-auth-user@hackflow.com';
    await User.deleteMany({ email: testEmail });
    await RefreshToken.deleteMany({});
    await BlacklistedToken.deleteMany({});

    console.log('\nCreating verified test user...');
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const testUser = await User.create({
        firstName: 'Test',
        lastName: 'AuthUser',
        username: 'testauthuser_' + Date.now(),
        email: testEmail,
        password: hashedPassword,
        role: 'participant',
        isEmailVerified: true
    });
    console.log(`Test user created: ${testUser.email} (${testUser._id})`);

    // --- TEST 1: Login ---
    console.log('\n--- Test 1: loginUser ---');
    const mockReqLogin = {
        body: {
            email: testEmail,
            password: 'password123'
        }
    };

    let cookies = {};
    const mockResLogin = {
        cookie: function(name, val, options) {
            cookies[name] = val;
            console.log(`Cookie set: ${name} = ${val.substring(0, 25)}... [maxAge: ${options.maxAge}]`);
        },
        clearCookie: function(name) {
            delete cookies[name];
            console.log(`Cookie cleared: ${name}`);
        },
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log('Login Response JSON:', data);
        }
    };

    await authController.loginUser(mockReqLogin, mockResLogin);

    if (mockResLogin.statusCode !== 200) {
        throw new Error('Login failed!');
    }
    if (!cookies.accessToken || !cookies.refreshToken) {
        throw new Error('Access or Refresh tokens not set in cookies!');
    }
    console.log('Login tokens set successfully!');

    // Verify refresh token is in DB
    const savedRefreshToken = await RefreshToken.findOne({ token: cookies.refreshToken });
    if (!savedRefreshToken) {
        throw new Error('Refresh token not saved to database!');
    }
    console.log('Refresh token verified in MongoDB:', savedRefreshToken.token.substring(0, 25) + '...');

    // --- TEST 2: Protect Middleware (Valid Token) ---
    console.log('\n--- Test 2: protect Middleware (Valid Token) ---');
    const mockReqProtect = {
        cookies: {
            accessToken: cookies.accessToken
        },
        method: 'GET',
        headers: {}
    };

    let protectNextCalled = false;
    const mockResProtect = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log('Protect Error Response:', data);
        }
    };

    await authMiddleware.protect(mockReqProtect, mockResProtect, () => {
        protectNextCalled = true;
    });

    if (!protectNextCalled) {
        throw new Error('protect middleware failed for valid access token!');
    }
    console.log('protect middleware verified req.user:', mockReqProtect.user.email);

    // --- TEST 3: Refresh Token Rotation (RTR) ---
    console.log('\n--- Test 3: refreshToken endpoint (RTR) ---');
    const mockReqRefresh = {
        cookies: {
            refreshToken: cookies.refreshToken
        }
    };

    let newCookies = {};
    const mockResRefresh = {
        cookie: function(name, val, options) {
            newCookies[name] = val;
            console.log(`New Cookie set: ${name} = ${val.substring(0, 25)}...`);
        },
        clearCookie: function(name) {
            delete newCookies[name];
            console.log(`Cookie cleared: ${name}`);
        },
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log('Refresh Response JSON:', data);
        }
    };

    await authController.refreshToken(mockReqRefresh, mockResRefresh);

    if (mockResRefresh.statusCode !== 200) {
        throw new Error('Token refresh failed!');
    }
    if (!newCookies.accessToken || !newCookies.refreshToken) {
        throw new Error('Token refresh did not set new cookies!');
    }
    console.log('Token refresh successful! Access and Refresh tokens rotated.');

    // Verify old refresh token is deleted
    const oldTokenCheck = await RefreshToken.findOne({ token: cookies.refreshToken });
    if (oldTokenCheck) {
        throw new Error('Old refresh token was not deleted from DB after rotation!');
    }
    console.log('Old refresh token deleted from DB successfully.');

    // Verify new refresh token is in DB
    const newTokenCheck = await RefreshToken.findOne({ token: newCookies.refreshToken });
    if (!newTokenCheck) {
        throw new Error('New rotated refresh token was not saved to DB!');
    }
    console.log('New rotated refresh token verified in MongoDB.');

    // --- TEST 4: Reuse Detection (Replay Protection) ---
    console.log('\n--- Test 4: Reuse Detection (Replay Protection) ---');
    const mockReqReplay = {
        cookies: {
            refreshToken: cookies.refreshToken // Use the old (already rotated) token again
        }
    };

    let replayClearedCookies = false;
    const mockResReplay = {
        cookie: function(name, val) {
            if (val === '') replayClearedCookies = true;
        },
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log('Replay Response JSON:', data);
        }
    };

    await authController.refreshToken(mockReqReplay, mockResReplay);

    if (mockResReplay.statusCode !== 401) {
        throw new Error('Replay attack was not blocked with 401!');
    }
    const remainingUserTokens = await RefreshToken.find({ user: testUser._id });
    if (remainingUserTokens.length > 0) {
        throw new Error('Replay attack failed to invalidate all user sessions!');
    }
    console.log('Replay detection blocked the attack and successfully revoked all active sessions for the user!');

    // --- TEST 5: Logout and Blacklisting ---
    console.log('\n--- Test 5: logoutUser & Access Token Blacklisting ---');
    
    // We log in again to get fresh valid tokens
    cookies = {};
    await authController.loginUser(mockReqLogin, mockResLogin);

    const mockReqLogout = {
        cookies: {
            accessToken: cookies.accessToken,
            refreshToken: cookies.refreshToken
        }
    };

    let logoutCookiesCleared = 0;
    const mockResLogout = {
        cookie: function(name, val, options) {
            if (val === '' && options.expires.getTime() === 0) {
                logoutCookiesCleared++;
            }
        },
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log('Logout Response JSON:', data);
        }
    };

    await authController.logoutUser(mockReqLogout, mockResLogout);

    if (mockResLogout.statusCode !== 200) {
        throw new Error('Logout failed!');
    }
    if (logoutCookiesCleared < 3) {
        throw new Error('Logout did not clear all cookies!');
    }
    
    const isTokenBlacklisted = await BlacklistedToken.exists({ token: cookies.accessToken });
    if (!isTokenBlacklisted) {
        throw new Error('Access token was not blacklisted on logout!');
    }
    console.log('Access token successfully blacklisted in MongoDB.');

    const isRefreshTokenDeleted = await RefreshToken.exists({ token: cookies.refreshToken });
    if (isRefreshTokenDeleted) {
        throw new Error('Refresh token was not deleted from DB on logout!');
    }
    console.log('Refresh token successfully deleted from MongoDB.');

    // --- TEST 6: Authenticating with Blacklisted Token ---
    console.log('\n--- Test 6: Authenticating with Blacklisted Token ---');
    const mockReqProtectBlacklisted = {
        cookies: {
            accessToken: cookies.accessToken // Try to use the blacklisted access token
        },
        method: 'GET',
        headers: {}
    };

    let blacklistedNextCalled = false;
    const mockResProtectBlacklisted = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log('Access Denied (Expected):', data.message);
        }
    };

    await authMiddleware.protect(mockReqProtectBlacklisted, mockResProtectBlacklisted, () => {
        blacklistedNextCalled = true;
    });

    if (blacklistedNextCalled) {
        throw new Error('protect middleware allowed access using a blacklisted token!');
    }
    if (mockResProtectBlacklisted.statusCode !== 401) {
        throw new Error(`Expected 401 for blacklisted token, got ${mockResProtectBlacklisted.statusCode}`);
    }
    console.log('Verification succeeded! Blacklisted token blocked successfully.');

    // --- CLEANUP ---
    await User.deleteMany({ email: testEmail });
    await RefreshToken.deleteMany({});
    await BlacklistedToken.deleteMany({});
    console.log('\nAll security validation checks PASSED successfully!');
}

runTests().then(() => {
    mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('\nTest failed with error:', err);
    mongoose.disconnect();
    process.exit(1);
});
