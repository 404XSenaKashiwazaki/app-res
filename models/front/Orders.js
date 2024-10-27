import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"
import { OrdersItem } from "../Index.js";

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
        type: DataTypes.ENUM("Pending", "Completed", "Cancelled"),
        defaultValue: "Pending"
    }
},{
    freezeTableName: true,
    paranoid: true,
    hooks:{
        afterBulkDestroy: async i => {
            await OrdersItem.destroy({  where: {  OrderId: i.where.id }, force: true})
            console.log("DELETE ORDER ITEM");
            
        },
        afterCancelOrders: async (produk, options) => {
            await  OrdersItem.destroy({  where: {  OrderId: i.where.id }, force: false})
            console.log("CANCEL ORDER ITEM");
        }
    }
})



// foreign key
// userid, tabelid
export default Orders