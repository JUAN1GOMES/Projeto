const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Room = sequelize.define('Room', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('sala', 'laboratorio'),
        allowNull: false
    },
    block: {
        type: DataTypes.STRING
    },
    capacity: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'rooms',
    timestamps: false
});

module.exports = Room;