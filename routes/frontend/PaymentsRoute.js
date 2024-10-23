import express from "express"
import { destroy, findAll, findOne, store } from "../../controllers/frontend/PaymentsController"
import { validate } from "../../validators/Validator.js"
import upload from "../../middleware/ValidateUpload.js"
import { rule } from "../../validators/custom/PaymentsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/payments")
.get(VerifyToken,findAll)

routes.route("/payments/:id")
.get(VerifyToken,findOne)

routes.route("/payments/add")
.post(upload("payments","single","").any(),validate(rule),store)

routes.route("/payments/destroy")
.delete(VerifyToken,destroy)

export default routes