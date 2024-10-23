import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../../config/Database.js"

const Payments = sequelize.define("Payments",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    amount: {
        type: DataTypes.STRING
    },
    // payment_method: {
    //     type: DataTypes.ENUM("Cash", "Credit_card", "Debit_card", "Digital_wallet"),
    //     defaultValue:"Cash"
    // },
    payment_date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW")
    },
    status:{
        type: DataTypes.ENUM("Paid","Canceled"),
        defaultValue: "Canceled"
    }
},{
    freezeTableName: true,
    paranoid: true,

})

// foreign key
// orderid
export default Payments