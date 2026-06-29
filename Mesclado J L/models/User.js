const { DataTypes } = require("sequelize");
const sequelize = require("../config/bd");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false
    }

}, {
    tableName: "users"
});

module.exports = User;