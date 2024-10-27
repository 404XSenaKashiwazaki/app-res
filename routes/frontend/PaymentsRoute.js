import express from "express"
import { destroy, findAll, findOne, store } from "../../controllers/frontend/PaymentsController.js"
import { validate } from "../../validators/Validator.js"
import upload from "../../middleware/ValidateUpload.js"
import { rule } from "../../validators/custom/PaymentsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/payments/:username/")
.get(findAll)

routes.route("/payments/:username/:id")
.get(findOne)

routes.route("/payments/:username/add")
.put(upload("payments","single","").any(),validate(rule),store)

routes.route("/payments/destroy")
.delete(destroy)

export default routes