import express from "express"
import {  } from "express-validator"
import { login, logout, register } from "../controllers/AuthController.js"
import { VerifyToken } from "../middleware/VerifyToken.js"
import { ruleLogin, ruleRegister } from "../validators/AuthValidators.js"
import { validate } from "../validators/Validator.js"

const routes = express.Router()



routes.post("/auth/login",validate(ruleLogin),login)
routes.post("/auth/register", validate(ruleRegister) , register)
routes.delete("/auth/logout",VerifyToken,logout)

export default routes