import express from "express"
import { RefreshToken } from "../controllers/RefreshToken.js"
const routes = express.Router()

routes.route("/auth/token").get(RefreshToken)
export default routes