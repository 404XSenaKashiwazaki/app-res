import express from "express"
import { destroy, findAll, findOne, store } from "../../controllers/frontend/OrdersController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateItemProducts } from "../../validators/custom/OrdersCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/orders/:username")
.get(findAll)

routes.route("/orders/:username/:id")
.get(findOne)

routes.route("/orders/:username/add")
.post(fileUploads("orders","orders","").any(),validate(rule),validateItemProducts,store)

routes.route("/orders/destroy")
.delete(destroy)

export default routes