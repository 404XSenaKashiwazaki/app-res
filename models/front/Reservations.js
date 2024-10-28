import { DataTypes, Sequelize } from "sequelize"
import sequelize from "../../config/Database.js"
import { Tables } from "../Index.js";

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
    updatedAt: false,
    paranoid: true,
    hooks:{
        afterCreate: async (i,o) => {
            console.log({ i });
            console.log({o});
            await Tables.increment("table_filled",{ where: { id: i.TableId } })
        },
        afterUpdate: async (i,o) => {
            console.log({ i });
            console.log({o});
            const tableOldInDb = await Tables.findOne({ where:{  id: o.tabeleidold} })
            console.log(tableOldInDb);
            // if(tableOldInDb.table_filled != 0 ) await Tables.decrement("table_filled",{ where: { id: o.tabeleidold } })
            
            // await Tables.increment("table_filled",{ where: { id: i.TableId  } })
        },
        afterBulkUpdate: async (i,o) => {
            console.log({ i });
            console.log({o});
            const tableOldInDb = await Tables.findOne({ where:{  id: i.tabeleidold} })
            console.log(tableOldInDb);
            if(tableOldInDb.table_filled != 0 ) await Tables.decrement("table_filled",{ where: { id: i.tabeleidold } })
        },
    }
    
})

// foreign key
// orderid, tableid
export default Reservations