const sequelize = require('../config/bd');

const User = require('./User');
const Room = require('./Room');
const UsageRecord = require('./UsageRecord');

User.hasMany(UsageRecord, {
    foreignKey: 'userId'
});

UsageRecord.belongsTo(User, {
    foreignKey: 'userId'
});

Room.hasMany(UsageRecord, {
    foreignKey: 'roomId'
});

UsageRecord.belongsTo(Room, {
    foreignKey: 'roomId'
});

module.exports = {
    sequelize,
    User,
    Room,
    UsageRecord
};