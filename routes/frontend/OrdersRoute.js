import express from "express"
import { cancel, destroy, findAll, findOne, quantity, store, checkout } from "../../controllers/frontend/OrdersController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, ruleOders, validateDuplicate, validateItemProducts, ruleQuantity } from "../../validators/custom/OrdersCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"
import { validationResult } from "express-validator"

const routes = express.Router()

routes.route("/orders/:username")
.get(findAll)

routes.route("/orders/:username/:id")
.get(findOne)

routes.route("/orders/:username/add")
.post(fileUploads("orders","orders","").any(),validate(ruleOders),validateItemProducts,validateDuplicate,store)

routes.route("/orders/:username/:orderid/checkout")
.put(fileUploads("orders","orders","").any(),checkout)

routes.route("/orders/:username/:orderid/:productid/quantity/:type")
.put(quantity)

routes.route("/orders/:username/:orderid/cancel") //type=cancel
.delete(cancel)

routes.route("/orders/:username/:orderid/destroy") //type=destoy
.delete(destroy)

export default routes