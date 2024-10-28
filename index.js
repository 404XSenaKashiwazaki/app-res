// ================= import library // =================
import express from "express"
import cookieParser from "cookie-parser"
import env from "dotenv"
import bodyParser from "body-parser"
import Cors from "cors"
// ================= import library // =================

// ================= import routes backend // =================
import UsersRoute from "./routes/backend/UsersRoute.js"
import RolesRoute from "./routes/backend/RolesRoute.js"
import ContactRoute from "./routes/backend/ContactsRoute.js"
import CommentRoute from "./routes/backend/CommentsRoute.js"
import ProductRoute from "./routes/backend/ProductsRoute.js"
import CategorieRoute from "./routes/backend/CategoriesRoute.js"
import PaymentMethodRoute from "./routes/backend/PaymentsMethodsRoute.js"
import TableRoute from "./routes/backend/TablesRoute.js"
import ShopsRoute from "./routes/backend/ShopsRoute.js"
import ShopsOrdersRoute from "./routes/backend/ShopsOrdersRoute.js"
// ================= import routes backend // =================

// ================= import routes frontend // =================
import ProductsFrontRoute from "./routes/frontend/ProductsRoute.js"
import OrdersFrontRoute from "./routes/frontend/OrdersRoute.js"
import PaymentsFrontRoute from "./routes/frontend/PaymentsRoute.js"
import ShopsFrontRoute from "./routes/frontend/ShopsRoute.js" 
// ================= import routes frontend // =================

// ================= import routes auth // =================
import AuthRoute from "./routes/AuthRoute.js"
import RefreshTokenRoute from "./routes/RefreshTokenRoute.js"
import ProfileRoute from "./routes/ProfileRoute.js"
// ================= import routes  auth // =================

// ================= import models // =================
import Database from "./config/Database.js"
// ================= import models // =================

// ================= import widdleware // =================
import CreateError from "./middleware/CreateError.js"
import { Orders, OrdersItem, Payments, Products, Shops } from "./models/Index.js"

// ================= import middleware // =================

// ================= express // =================
env.config()
const app = express()
// ================= express // =================

// ================= cors akses url // =================
let whitelist = ['http://localhost:5173']
let corsOpt = function (req, callback) {
    let corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true ,credentials: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false, credentials: true } // disable CORS for this request
    }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
// ================= cors akses url // =================

// ================= db sync // =================
const _run =  () => {
    console.log("// ==================== APP-RES ==================== //")
    Database.query("SET FOREIGN_KEY_CHECKS = 0").then(async () =>{
    //    const users =  await Products.findOne({ where: { id: 1 } })
    //    const products = await users.getProducts()
    // await Products.destroy({ where: { UserId: [1]} })
    // await Promise.all(products.map(product => product.destroy()))
        // await Orders.sync({ force: true })
        // await Shops.sync({ force: true })
        // await Payments.sync({ force: true })
        // await OrdersItem.sync({ force: true })
        // await Products.sync({ force: true })
        // await ImageProducts.sync({ force: true })
        // await User_Products.sync({ force: true })

        // await Database.sync({ force: true })
        // await Userd.sync({ force: true })
        // await Comment.sync({ force: true })
        // await Contact.sync({ force: true })
        // await Roles.sync({ force: true })
        // await User_Role.sync({ force: true })
    //   await FilesShares.sync({ force: true })
    })
    .catch(err=> console.log("ERROR SYNC DATABASE ", err))
    .finally(()=>{
      console.log("// ==================== APP-RES ==================== //")
    })
}

_run()
// ================= db sync // =================

// ================= express config // =================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(express.json())
app.use(Cors(corsOpt))
// ================= express config // =================

// ================= express config statis file// =================
app.use("/products",express.static("./public/products"))
app.use("/shops",express.static("./public/shops"))
// ================= express config statis file// =================

// ================= routes auth // =================
app.use("/api/",AuthRoute)
// ================= routes auth // =================

// ================= routes backend // =================
app.use("/api/",UsersRoute)
app.use("/api/",RolesRoute)
app.use("/api/",ContactRoute)
app.use("/api/",CommentRoute)
app.use("/api/",ProductRoute)
app.use("/api/",CategorieRoute)
app.use("/api/",TableRoute)
app.use("/api/",PaymentMethodRoute)
app.use("/api/",ShopsRoute)
app.use("/api",ShopsOrdersRoute)
// ================= routes backend // =================

// ================= routes frontend // =================
app.use("/",ProductsFrontRoute)
app.use("/",OrdersFrontRoute)
app.use("/",PaymentsFrontRoute)
app.use("/",ShopsFrontRoute)
// ================= routes frontend // =================

// ================= routes refreshtoken // =================
app.use("/api",RefreshTokenRoute)
// ================= routes refreshtoken // =================

// ================= routes profile // =================
app.use("/",ProfileRoute)
// ================= routes profile // =================

// ================= middleware error // =================
app.use(CreateError)
// ================= middleware error // =================

// ================= express server // =================
app.listen(process.env.APP_PORT,()=>{
    console.log("Server runing in port "+process.env.APP_PORT)
    console.log("// ==================== APP-RES ==================== //")
})
// ================= express server // =================
