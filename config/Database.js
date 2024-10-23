import env from "dotenv"
import { Sequelize } from "sequelize"
env.config()

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: console.log
})

await sequelize.sync({ force: true })
export default sequelize