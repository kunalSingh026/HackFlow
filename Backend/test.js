const mongoose = require('mongoose');
require('dotenv').config();
const Team = require('./src/models/team.model');
const User = require('./src/models/user.model');
const Event = require('./src/models/event.model');
const { requestToJoin } = require('./src/controllers/teamController');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const req = {
            params: { teamId: '' },
            user: { id: '', firstName: 'Test', lastName: 'User' }
        };
        const res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                console.log('Response:', this.statusCode, data);
            }
        };

        const event = await Event.findOne();
        const leader = await User.findOne();
        const user = await User.findOne({ _id: { $ne: leader._id } });

        const team = await Team.create({
            name: 'Test Team ' + Date.now(),
            event: event._id,
            leader: leader._id,
            members: [leader._id],
            joinCode: 'TEST' + Date.now()
        });

        const Registration = mongoose.model('Registration');
        await Registration.create({ user: user._id, event: event._id }).catch(e => console.log('Registration might exist'));

        req.params.teamId = team._id;
        req.user.id = user._id;
        req.user.firstName = user.firstName;
        req.user.lastName = user.lastName;

        console.log("Calling requestToJoin");
        await requestToJoin(req, res);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit(0);
    }
});
