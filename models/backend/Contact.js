import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"

const Contact = sequelize.define("Contact", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    email: {
        type: DataTypes.STRING("100"),
        allowNull: false,
        defaultValue: "your_email@gmail.com",
    },
    username: DataTypes.STRING(50),
    content: {
        type: DataTypes.STRING(200),
        defaultValue: "",
        allowNull: true
    },
    tanggapan: {
        type: DataTypes.STRING(200),
        defaultValue: "",
        allowNull: true
    },
},{ 
    freezeTableName: true,
    paranoid: true
})

export default Contact