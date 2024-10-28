import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"

const Shops = sequelize.define("Shops",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    name: {
        type: DataTypes.STRING(200),
    },
    logo:{
        type: DataTypes.STRING(400)
    },
    logo_url:{
        type: DataTypes.STRING(500)
    },
    desk: {
        type: DataTypes.TEXT
    },
    id_card:{
        type: DataTypes.STRING(500)
    },
    comment: {
        type: DataTypes.TEXT
    },
    status:{
        type: DataTypes.ENUM("Reviewed","Approved", "NotApproved"),
        defaultValue: "Reviewed"
    }
},{
    freezeTableName: true,
    paranoid: true
})

export default Shops