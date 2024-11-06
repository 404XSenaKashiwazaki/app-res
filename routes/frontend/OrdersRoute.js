import express from "express"
import { cancel, destroy, findAll, findOne, quantity, store, checkout, accepted } from "../../controllers/frontend/OrdersController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, ruleOders, validateDuplicate, validateItemProducts, ruleQuantity } from "../../validators/custom/OrdersCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"
import { validationResult } from "express-validator"

const routes = express.Router()

routes.route("/shoppingcart/:username")
.get(findAll)

routes.route("/shoppingcart/:username/:id")
.get(findOne)

routes.route("/shoppingcart/:username/add")
.post(fileUploads("orders","orders","").any(),validate(ruleOders),validateItemProducts,validateDuplicate,store)

routes.route("shoppingcart/:username/:orderid/checkout")
.put(fileUploads("orders","orders","").any(),checkout)

routes.route("/shoppingcart/:username/:orderid/:productid/quantity/:type")
.put(quantity)

routes.route("/shoppingcart/:username/:orderid/accepted")
.put(accepted)

routes.route("/shoppingcart/:username/:orderid/cancel") //type=cancel
.delete(cancel)

routes.route("/shoppingcart/:username/:orderid/destroy") //type=destoy
.delete(destroy)

export default routes