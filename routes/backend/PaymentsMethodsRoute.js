import express from "express"
import { destroy, findAll, findOne, restore, store, update } from "../../controllers/backend/PaymentsMethodsController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateDuplicate, validateUpdate } from "../../validators/custom/PaymentsMethodsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/payments-methods")
.get(findAll)

routes.route("/payments-methods/:id")
.get(findOne)

routes.route("/payments-methods/add")
.post(fileUploads("payments_methods","profile","./public/profile").any(),validate(rule),validateDuplicate,store)
routes.route("/payments-methods/update")
.put(fileUploads("payments_methods","profile","./public/profile").any(),validate(rule),validateDuplicate,validateUpdate,update)

routes.route("/payments-methods/destroy")
.delete(destroy)

routes.route("/payments-methods/restore")
.put(restore)

export default routes