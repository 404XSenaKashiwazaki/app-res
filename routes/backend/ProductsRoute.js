import express from "express"
import { createSlug, destroy, findAll, findOne, restore, store, update } from "../../controllers/backend/ProductsController.js"
import { validate } from "../../validators/Validator.js"

import upload, { fileUploads } from "../../middleware/ValidateUpload.js"
import { rule, validateDuplicate, validateImageProduk, validateUpdate } from "../../validators/custom/ProductsCustomValidator.js"
import { VerifyToken } from "../../middleware/VerifyToken.js"
import { body, checkSchema } from "express-validator"

const routes = express.Router()

routes.route("/products")
.get(findAll)

routes.route("/products/:id")
.get(findOne)

routes.route("/products/add")
.post(fileUploads("products","products","./public/products").any(),validate(rule),validateDuplicate,store)
routes.route("/products/update")
.put(fileUploads("products","products","./public/products").any(),validate(rule),validateDuplicate,validateUpdate,update)

routes.route("/products/destroy")
.delete(destroy)

routes.route("/products/restore")
.put(restore)

routes.route("/products/create-slug")
.post(upload("").any("products"),createSlug)

export default routes