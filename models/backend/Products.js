import { DataTypes } from "sequelize"
import Database from "../../config/Database.js"

import ImageProducts from "./ImageProducts.js"


const Products = Database.define("Products",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    kode_produk:{
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    nama_produk: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Nama Produk"
    },
    slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    stok_produk: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
    harga_produk: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
    status_produk: {
        type: DataTypes.ENUM("Tersedia","Tidak Tersedia"),
        defaultValue: "Tidak Tersedia",
        allowNull: false,
    },
    desk_produk: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Deskripsi Produk"
    }
},{
    freezeTableName: true,
    paranoid: true,
    hooks: {
        afterBulkDestroy: async (i,o) => {
            const id = i.where.UserId
            const ids = (await Products.findAll({ where: { UserId: id }, paranoid: false, include: [ImageProducts], attributes: ["id"]})).map(e=> e.id)
            await ImageProducts.destroy({ where: { ProductId: ids} })
        },
        afterBulkRestore: async (i) => {
            const id = i.where.UserId
            const ids = (await Products.findAll({ where: { UserId: id }, paranoid: false, include: [ImageProducts], attributes: ["id"]})).map(e=> e.id)
            await ImageProducts.restore({ where: { ProductId: ids} })
        }
    }
})

export default Products
