import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"

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
})



// foreign key
// userid, tabelid
export default Orders