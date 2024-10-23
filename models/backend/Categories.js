import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"

const Categories = sequelize.define("Categories",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    nama: {
        type: DataTypes.STRING,
    },
    desc: {
        type: DataTypes.STRING
    }
},{
    freezeTableName: true,
    paranoid: true
})

export default Categories