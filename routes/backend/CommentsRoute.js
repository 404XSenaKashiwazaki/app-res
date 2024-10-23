import express from "express"
import { destroy, findAll, findOne, restore } from "../../controllers/backend/CommentsController.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/comments")
.get(VerifyToken,findAll)

routes.route("/comments/:id")
.get(VerifyToken,findOne)

routes.route("/comments/destroy")
.delete(VerifyToken,destroy)

routes.route("/comments/restore")
.put(VerifyToken,restore)

export default routes