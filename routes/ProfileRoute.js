import express from "express"
import { find, update } from "../controllers/ProfilesController.js"
import { validate } from "../validators/Validator.js"
import upload from "../middleware/ValidateUpload.js"
import { afterValidate, rule} from "../validators/custom/ProfileCustomValidator.js"

const routes = express.Router()

routes.route("/profile/:username")
.get(find)
.put(upload("").any("username"),validate(rule),afterValidate,update)

export default routes