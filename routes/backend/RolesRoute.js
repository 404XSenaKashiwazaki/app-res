import express from "express"
import { destroy, findAll, findOne, restore, store, update } from "../../controllers/backend/RolesController.js"
import { validate } from "../../validators/Validator.js"
import upload, { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateDuplicate, validateUpdate } from "../../validators/custom/RolesCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/roles")
.get(VerifyToken,findAll)

routes.route("/roles/:id")
.get(VerifyToken,findOne)

routes.route("/roles/add")
.post(fileUploads("roles","profile","./public/profile").any(),validate(rule),validateDuplicate,store)
routes.route("/roles/update")
.put(VerifyToken,fileUploads("roles","profile","./public/profile").any(),validate(rule),validateDuplicate,validateUpdate,update)

routes.route("/roles/destroy")
.delete(VerifyToken,destroy)

routes.route("/roles/restore")
.put(VerifyToken,restore)

export default routes