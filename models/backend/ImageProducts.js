import { DataTypes } from "sequelize"
import Database from "../../config/Database.js"

const ImageProducts = Database.define("ImageProducts",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nama_image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "gambar-produk.png"
    },
    url_image:{
        type: DataTypes.STRING,
        defaultValue: "http://localhost:8000/products/gambar-produk.png"
    },
    kode_image: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
},{
    freezeTableName: true,
    paranoid: true
})

export default ImageProducts
