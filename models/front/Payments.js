import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../../config/Database.js"
import Orders from "./Orders.js"

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
    bill_amount:{
        type: DataTypes.STRING,
    },
    return_amount:{
        type: DataTypes.STRING,
    },
    // payment_method: {
    //     type: DataTypes.ENUM("Cash", "Credit_card", "Debit_card", "Digital_wallet"),
    //     defaultValue:"Cash"
    // },
    payment_date: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
    },
    status:{
        type: DataTypes.ENUM("Waiting_For_Payment","Paid","Cancelled"),
        defaultValue: "Waiting_For_Payment"
    }
},{
    freezeTableName: true,
    paranoid: true,
    hooks: {
        afterUpsert: async (i,o)=> {
            await Orders.update({ status: "Prepared"},{ where: { id: o.orderid } })
        }
    }
})

// foreign key
// orderid
export default Payments