import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"

const Tables = sequelize.define("Tables",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    table_number: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    table_filled:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 4
    },
    status:{
        type: DataTypes.ENUM("Available", "Reserved", "Occupied"),
        defaultValue: "Available"
    }
},{
    freezeTableName: true,
    paranoid: true
})

export default Tables