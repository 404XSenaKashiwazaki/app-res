import express from "express"
import { destroy, findAll, findOne, restore, store, update } from "../../controllers/backend/CategoriesController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateDuplicate, validateUpdate } from "../../validators/custom/CategoriesCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"

const routes = express.Router()

routes.route("/categories")
.get(findAll)

routes.route("/categories/:id")
.get(findOne)

routes.route("/categories/add")
.post(fileUploads("categories","profile","./public/profile").any(),validate(rule),validateDuplicate,store)
routes.route("/categories/update")
.put(fileUploads("categories","profile","./public/profile").any(),validate(rule),validateDuplicate,validateUpdate,update)

routes.route("/categories/destroy")
.delete(destroy)

routes.route("/categories/restore")
.put(restore)

export default routes