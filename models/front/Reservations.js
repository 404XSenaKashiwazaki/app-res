import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../../config/Database.js"

const Reservations = sequelize.define("Reservations",{
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    reservation_time: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW")
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
        defaultValue: "Pending"
    },
},{
    freezeTableName: true,
    paranoid: true,
    
})

// foreign key
// orderid, tableid
export default Reservations