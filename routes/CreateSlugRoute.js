import express from "express"
import { index } from "../controllers/CreateSlugController.js";
const routes = express.Router()

routes.post("/create-slug",index)
export default routes