import express from "express"
import { destroy, findAll, findOne, restore, store, update } from "../../controllers/backend/TablesController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateDuplicate, validateUpdate } from "../../validators/custom/TablesCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/tables")
.get(VerifyToken,findAll)

routes.route("/tables/:id")
.get(VerifyToken,findOne)

routes.route("/tables/add")
.post(VerifyToken,fileUploads("tables","tables","").any(),validate(rule),validateDuplicate,validateUpdate,store)
routes.route("/tables/update")
.put(VerifyToken,fileUploads("tables","tables","").any(),validate(rule),validateDuplicate,validateUpdate,update)

routes.route("/tables/destroy")
.delete(VerifyToken,destroy)

routes.route("/tables/restore")
.put(VerifyToken,restore)

export default routes