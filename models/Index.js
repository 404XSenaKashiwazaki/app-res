
import Users, { User_Role } from "./backend/Users.js"
import Roles from "./backend/Roles.js"
import Products from "./backend/Products.js"
import Orders from "./front/Orders.js"
import Comment from "./backend/Comment.js"
import Contact from "./backend/Contact.js"
import ImageProducts from "./backend/ImageProducts.js"
import Tables from "./backend/Tables.js"
import Reservations from "./front/Reservations.js"
import Payments from "./front/Payments.js"
import Category from "./backend/Categories.js"
import UsersDetails from "./backend/UsersDetails.js"
import PaymentsMethods from "./backend/PaymentMethods.js"
import Shops from "./backend/Shops.js"
import sequelize from "../config/Database.js"
import { DataTypes, Sequelize } from "sequelize"

const OrdersItem = sequelize.define("OrdersItems",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    quantity: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.STRING
    },
    ShopId: {
        type: DataTypes.BIGINT,
    },
    order_date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW")
    },
    OrderId: {
        type: DataTypes.BIGINT,
        references: {
            model: Orders,
            key: "id",
            
        },
    },
    ProductId: {
        type: DataTypes.BIGINT,
        references: {
            model: Products,
            key: "id"
        },
    },
},{
    freezeTableName: true,
    paranoid: true,
    hooks: {
        afterBulkCreate: i => {
            i.map(async (item, indx) => {
                await Products.decrement("stok_produk",{ by: item.quantity, where: { id: item.ProductId } })
            })
        },
        beforeBulkDestroy: async i => {
            const orderItem = await OrdersItem.findAll({  where: {  OrderId: i.where.OrderId}, paranoid: false})
            console.log("sakgfosdgjdfijhdfkd",orderItem);
                orderItem.map(async (item, indx) => {
                    console.log(item);
                    
                    await Products.increment("stok_produk",{ by: item.quantity, where: { id: item.ProductId } }) //bug masih bisa di increment produk, padahal order sudah di hapus
                })
                // console.log(i);
                
        }
    }

})


Users.belongsToMany(Roles,{through: User_Role, onDelete: "CASCADE"})
Roles.belongsToMany(Users,{through: User_Role })

Users.hasOne(UsersDetails,{ onDelete: "CASCADE" })
UsersDetails.belongsTo(Users)

Shops.hasMany(Comment,{ onDelete: "CASCADE" })
Comment.belongsTo(Shops)

Users.hasMany(Contact,{ onDelete: "CASCADE"})
Contact.belongsTo(Users)

Users.hasOne(Shops,{  onDelete: "CASCADE"})
Shops.belongsTo(Users)

// casecade di tabel induk
Shops.hasMany(Products,{  onDelete: "CASCADE" })
Products.belongsTo(Shops)

Products.hasMany(ImageProducts,{ onDelete: "CASCADE" })
ImageProducts.belongsTo(Products)

Category.hasMany(Products,{ onDelete: "SET NULL"})
Products.belongsTo(Category)

Users.hasMany(Orders,{ onDelete: "CASCADE"})
Orders.belongsTo(Users)

Orders.belongsToMany(Products,{ through: OrdersItem , foreignKey: "OrderId"})
Products.belongsToMany(Orders,{ through: OrdersItem, foreignKey: "ProductId" })

Orders.hasOne(Payments,{ onDelete: "CASCADE" })
Payments.belongsTo(Orders)

Shops.hasMany(Tables,{ onDelete: "CASCADE" })
Tables.belongsTo(Shops)

Tables.belongsToMany(Users,{ through: Reservations })
Users.belongsToMany(Tables,{ through: Reservations })

PaymentsMethods.hasMany(Payments,{  onDelete: "CASCADE" })
Payments.belongsTo(PaymentsMethods)

export {  
    Users, 
    Roles, 
    Products, 
    User_Role, 
    UsersDetails, 
    Contact,
    Comment, 
    ImageProducts,
    Category,
    Orders,
    OrdersItem,
    Tables,
    Reservations,
    Payments,
    PaymentsMethods,
    Shops
}
