import express from "express"
import { findAll, findOne, store } from "../../controllers/backend/ShopsOrdersController.js"
import { validate } from "../../validators/Validator.js"
import upload, { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateDuplicate } from "../../validators/custom/ShopsOrdersCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/shops/orders/:username")
.get(findAll)

routes.route("/shops/orders/:username/:id")
.get(findOne)

routes.route("/shops/orders/:username")
.put(fileUploads("shopsorders","logo","").any(),validate(rule),validateDuplicate,store)

export default routes