import { DataTypes } from "sequelize"
import Database from "../../config/Database.js"

const UsersDetails = Database.define("UsersDetails",{
    id:{
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        unique: true
    },
    profile: {
        type: DataTypes.STRING("500"),
        allowNull: false,
        defaultValue: "default.jpg"
    },
    profileUrl: {
        type: DataTypes.STRING("500"),
        allowNull: false,
        defaultValue: "http://localhost:8000/images/default.jpg",
    },
    noHp: {
        type: DataTypes.STRING("13"),
        allowNull: false,
        defaultValue: "62",
    },
    alamat: {
        type: DataTypes.STRING("1000"),
        allowNull: false,
    },
    desc: {
        type: DataTypes.STRING("300"),
        allowNull: true,
    },
},{
    freezeTableName: true,
    paranoid: true
})


export default UsersDetails