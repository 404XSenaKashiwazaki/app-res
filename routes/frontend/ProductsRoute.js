import express from "express"
import { destroy, findAll, findOne, restore, store, update } from "../../controllers/frontend/ProductsController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule } from "../../validators/custom/ReservationsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/products")
.get(findAll)

routes.route("/products/:slug")
.get(findOne)

export default routes