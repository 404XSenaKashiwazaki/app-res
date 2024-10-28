import express from "express"
import { acc, destroy, findAll, findOne, restore, store, update } from "../../controllers/frontend/ShopsController.js"
import { validate } from "../../validators/Validator.js"
import upload, { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, ruleAcc, validateDuplicate, validateUpdate } from "../../validators/custom/ShopsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()


routes.route("/shops/:username")
.get(findOne)

routes.route("/shops/:username/add")
.post(fileUploads("shops","logo","./public/shops").any(),validate(rule),validateDuplicate,store)
routes.route("/shops/:username/update")
.put(fileUploads("shops","logo","./public/shops").any(),validate(rule),validateDuplicate,validateUpdate,update)

routes.route("/shops/:username/destroy")
.delete(destroy)

routes.route("/shops/:username/restore")
.put(restore)

export default routes