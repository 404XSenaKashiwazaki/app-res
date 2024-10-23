import express from "express"
import { destroy, findAll, findOne, isActive, nonActive, restore, store, update } from "../../controllers/backend/UsersController.js"
import { validate } from "../../validators/Validator.js"
import { fileUploads } from "../../middleware/ValidateUpload.js"
import { 
    rule, 
    validateDuplicate, 
    validateRoles,
    validateUpdate
} from "../../validators/custom/UsersCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"
const routes = express.Router()


routes.route("/users")
.get(VerifyToken,findAll)

routes.route("/users/:id")
.get(VerifyToken,findOne)

routes.route("/users/add")
.post(fileUploads("users","profile","./public/profile").any(),validate(rule),validateDuplicate,validateRoles,store)
routes.route("/users/update")
.put(VerifyToken,fileUploads("users","profile","./public/profile").any(),validate(rule),validateDuplicate,validateUpdate,update)

routes.route("/users/destroy")
.delete(destroy)

routes.route("/users/restore")
.put(restore)

routes.route("/users/isactive/:id")
.put(VerifyToken,isActive)


routes.route("/users/nonactive/:id")
.put(VerifyToken,nonActive)

export default routes