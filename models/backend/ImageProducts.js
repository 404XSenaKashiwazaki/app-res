import { DataTypes } from "sequelize"
import Database from "../../config/Database.js"

const ImageProducts = Database.define("ImageProducts",{
    nama_image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "gambar-produk.png"
    },
    url_image:{
        type: DataTypes.STRING,
        defaultValue: "http://localhost:8000/products/gambar-produk.png"
    },
},{
    freezeTableName: true,
    paranoid: true
})

export default ImageProducts
