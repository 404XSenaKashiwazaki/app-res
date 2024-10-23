import { DataTypes } from "sequelize"
import sequelize from "../../config/Database.js"

const Comment = sequelize.define("Comment", {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    username: {
        type: DataTypes.STRING("10"),
        allowNull: true,
        defaultValue: "username"
    },
    email: {
        type: DataTypes.STRING("100"),
        allowNull: true,
        defaultValue: "your_email@gmail.com",
    },
    content: {
        type: DataTypes.TEXT,
        defaultValue: "cotent",
        allowNull: true
    },

},{ 
    freezeTableName: true,
    paranoid: true
})

export default Comment