import { DataTypes } from "sequelize"
import Database from "../../config/Database.js"

const PaymentsMethods = Database.define("PaymentsMethods",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    desk: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Deskripsi Payment"
    }
},{
    freezeTableName: true,
    paranoid: true
})

export default PaymentsMethods
