const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const UsageRecord = sequelize.define('UsageRecord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    purpose: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'usage_records',
    timestamps: false
});

module.exports = UsageRecord;