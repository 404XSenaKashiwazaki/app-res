import { DataTypes } from "sequelize"
import Database from "../../config/Database.js"

const Roles = Database.define("Roles",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    desk: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "deskripsi role"
    }
},{
    freezeTableName: true,
    paranoid: true
})

export default Roles
