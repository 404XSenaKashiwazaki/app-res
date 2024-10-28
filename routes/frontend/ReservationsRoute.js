import express from "express"
import { destroy, findAll, findOne, restore, store, update } from "../../controllers/frontend/ReservationsController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateDuplicate } from "../../validators/custom/ReservationsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"
import { check } from "express-validator"

const routes = express.Router()

routes.route("/reservations/:username")
.get(findAll)

routes.route("/reservations/:username/:id")
.get(findOne)

routes.route("/reservations/:username/add")
.post(fileUploads("reservations","reservations","").any(),validate(rule),validateDuplicate,store)
routes.route("/reservations/:username/update")
.put(fileUploads("reservations","reservations","").any(),validate([...rule,  check("TableIdOld").trim().notEmpty().withMessage("Meja tidak boleh kosong")]),validateDuplicate,update)

routes.route("/reservations/:username/destroy")
.delete(destroy)

routes.route("/reservations/:username/restore")
.put(restore)

export default routes