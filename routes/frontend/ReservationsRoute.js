import express from "express"
import { destroy, findAll, findOne, restore, store, update } from "../../controllers/frontend/ReservationsController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule } from "../../validators/custom/ReservationsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/reservations")
.get(VerifyToken,findAll)

routes.route("/reservations/:id")
.get(VerifyToken,findOne)

routes.route("/reservations/add")
.post(fileUploads("reservations","reservations","").any(),validate(rule),store)
routes.route("/reservations/update")
.put(VerifyToken,fileUploads("reservations","reservations","").any(),update)

routes.route("/reservations/destroy")
.delete(VerifyToken,destroy)

routes.route("/reservations/restore")
.put(VerifyToken,restore)

export default routes