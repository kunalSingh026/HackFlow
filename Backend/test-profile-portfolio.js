const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user.model');
const userController = require('./src/controllers/userController');

async function runProfileTests() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const testEmail = 'portfolio-test-user@hackflow.com';
    // Clean up any existing test user
    await User.deleteMany({ email: testEmail });

    console.log('\nCreating a test user...');
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    let testUser = await User.create({
        firstName: 'Portfolio',
        lastName: 'Tester',
        username: 'portfoliotester_' + Date.now(),
        email: testEmail,
        password: hashedPassword,
        role: 'participant',
        isEmailVerified: true
    });
    console.log(`Test user created: ${testUser.username} (${testUser._id})`);

    // --- TEST 1: Update profile with new metrics and a valid project (title only, empty URLs) ---
    console.log('\n--- Test 1: Update with metrics and valid project (title only) ---');
    const mockReq1 = {
        user: { id: testUser._id.toString() },
        body: {
            hackathonsAttended: '3',
            projectsShipped: '5',
            availabilityStatus: 'Hacking',
            projectShowcase: JSON.stringify([
                {
                    title: 'Cinemax Reservation Hub',
                    description: 'A platform to book movie tickets',
                    repositoryUrl: '',
                    liveDemoUrl: ''
                }
            ])
        }
    };

    let updatedUser1 = null;
    const mockRes1 = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            if (this.statusCode === 200) {
                updatedUser1 = data.user;
                console.log('Update Successful. Response user:', {
                    hackathonsAttended: data.user.hackathonsAttended,
                    projectsShipped: data.user.projectsShipped,
                    availabilityStatus: data.user.availabilityStatus,
                    projectShowcase: data.user.projectShowcase
                });
            } else {
                console.error('Update Failed:', data);
            }
        }
    };

    await userController.updateProfile(mockReq1, mockRes1);

    if (mockRes1.statusCode !== 200 || !updatedUser1) {
        throw new Error('Test 1 failed: Profile update was not successful.');
    }

    if (updatedUser1.hackathonsAttended !== 3 || updatedUser1.projectsShipped !== 5 || updatedUser1.availabilityStatus !== 'Hacking') {
        throw new Error('Test 1 failed: Professional metrics did not save correctly.');
    }

    if (updatedUser1.projectShowcase.length !== 1) {
        throw new Error('Test 1 failed: Project showcase did not save correctly.');
    }

    const savedProject1 = updatedUser1.projectShowcase[0];
    if (savedProject1.title !== 'Cinemax Reservation Hub' || savedProject1.repositoryUrl !== '' || savedProject1.liveDemoUrl !== '') {
        throw new Error('Test 1 failed: Project details (empty URLs) did not persist correctly.');
    }
    console.log('Test 1 passed successfully!');

    // --- TEST 2: Update profile filtering out invalid projects (missing title) ---
    console.log('\n--- Test 2: Update with mixed valid/invalid projects (filtering) ---');
    const mockReq2 = {
        user: { id: testUser._id.toString() },
        body: {
            projectShowcase: JSON.stringify([
                {
                    title: '', // Invalid: empty title
                    description: 'No title project'
                },
                {
                    title: 'Valid Project 2',
                    description: 'Has a title',
                    repositoryUrl: 'https://github.com/test/repo'
                },
                {
                    // Invalid: missing title completely
                    description: 'No title key'
                }
            ])
        }
    };

    let updatedUser2 = null;
    const mockRes2 = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            if (this.statusCode === 200) {
                updatedUser2 = data.user;
                console.log('Update Successful. Response projects:', data.user.projectShowcase);
            } else {
                console.error('Update Failed:', data);
            }
        }
    };

    await userController.updateProfile(mockReq2, mockRes2);

    if (mockRes2.statusCode !== 200 || !updatedUser2) {
        throw new Error('Test 2 failed: Profile update was not successful.');
    }

    if (updatedUser2.projectShowcase.length !== 1) {
        throw new Error('Test 2 failed: Projects without titles were not filtered out correctly.');
    }

    if (updatedUser2.projectShowcase[0].title !== 'Valid Project 2') {
        throw new Error('Test 2 failed: Correct project title not saved.');
    }
    console.log('Test 2 passed successfully!');

    // --- TEST 3: Clear showcase to verify empty state persistence ---
    console.log('\n--- Test 3: Clear showcase projects (empty state) ---');
    const mockReq3 = {
        user: { id: testUser._id.toString() },
        body: {
            projectShowcase: JSON.stringify([])
        }
    };

    let updatedUser3 = null;
    const mockRes3 = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            if (this.statusCode === 200) {
                updatedUser3 = data.user;
                console.log('Update Successful. Response projects:', data.user.projectShowcase);
            } else {
                console.error('Update Failed:', data);
            }
        }
    };

    await userController.updateProfile(mockReq3, mockRes3);

    if (mockRes3.statusCode !== 200 || !updatedUser3) {
        throw new Error('Test 3 failed: Profile update was not successful.');
    }

    if (updatedUser3.projectShowcase.length !== 0) {
        throw new Error('Test 3 failed: Showcase project array was not cleared.');
    }
    console.log('Test 3 passed successfully!');

    // --- CLEANUP ---
    await User.deleteMany({ email: testEmail });
    console.log('\nAll portfolio and metrics backend integration tests passed!');
}

runProfileTests().then(() => {
    mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('\nTest failed with error:', err);
    mongoose.disconnect();
    process.exit(1);
});
