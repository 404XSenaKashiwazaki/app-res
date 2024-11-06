import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"

const Sites = sequelize.define("Sites", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    title: {
        type: DataTypes.STRING(200),
        defaultValue: "Title sites",
        allowNull: true
    },
    logo: {
        type: DataTypes.STRING(500),
        defaultValue: "default.jpg",
        allowNull: true
    },
    logo_url: {
        type: DataTypes.STRING(500),
        defaultValue: "http://localhost:8000/sites/default.jpg",
        allowNull: true
    },
    about: {
        type: DataTypes.STRING(100),
        defaultValue: "Title sites",
        allowNull: true
    },
    dmca: {
        type: DataTypes.STRING(300),
        defaultValue: "Title sites",
        allowNull: true
    },
    privacy_police: {
        type: DataTypes.STRING(300),
        defaultValue: "",
        allowNull: true
    },
},{ 
    freezeTableName: true,
    paranoid: true
})

export default Sites