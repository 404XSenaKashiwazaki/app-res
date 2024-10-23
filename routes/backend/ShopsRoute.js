import express from "express"
import { destroy, findAll, findOne, restore, store, update } from "../../controllers/backend/ShopsController.js"
import { validate } from "../../validators/Validator.js"
import upload, { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateDuplicate, validateUpdate } from "../../validators/custom/ShopsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/shops")
.get(VerifyToken,findAll)

routes.route("/shops/:id")
.get(VerifyToken,findOne)

routes.route("/shops/add")
.post(VerifyToken,fileUploads("shops","logo","./public/shops").any(),validate(rule),validateDuplicate,store)
routes.route("/shops/update")
.put(VerifyToken,fileUploads("shops","logo","./public/shops").any(),validate(rule),validateDuplicate,validateUpdate,update)

routes.route("/shops/destroy")
.delete(VerifyToken,destroy)

routes.route("/shops/restore")
.put(VerifyToken,restore)

export default routes