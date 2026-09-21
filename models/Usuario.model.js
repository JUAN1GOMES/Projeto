const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Usuario = sequelize.define('Usuario', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false
    },

    idade: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Usuario;