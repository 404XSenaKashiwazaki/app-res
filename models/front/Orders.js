import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"
import { OrdersItem, Payments } from "../Index.js";

const Orders = sequelize.define("Orders",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    total_price: {
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.ENUM("Shopping_Cart","Prepared","Pending", "Completed", "Cancelled"),
        defaultValue: "Shopping_Cart"
    }
},{
    freezeTableName: true,
    paranoid: true,
    hooks:{
        afterBulkDestroy: async (i,o) => {
            await OrdersItem.destroy({ where: {  OrderId: i.where.id }, force: i.force})
            if(i.cancel) await Payments.update({ status: "Cancelled" }, { where: { OrderId: i.where.id } })
        },

        afterUpdate: async (i,o)=> { 
            if(o.cancel) await Payments.update({ status: "Cancelled" },{ where: { OrderId: i.id }})
            if(o.checkout) await Payments.create({ amount: i.total_price, payment_date: null, status: "Waiting_For_Payment", OrderId: i.id, PaymentsMethodId: o.paymentid, bill_amount: i.total_price, return_amount: null})
        },

    }
})



// foreign key
// userid, tabelid
export default Orders