import jwt from "jsonwebtoken"
import env from "dotenv"
import { CreateErrorMessage } from "../utils/CreateError.js"

env.config()

export const VerifyToken = (req, res, nex) => {
    const headers = req["headers"]
    const authorization = headers.authorization || req.Authorization 
    if(!authorization || !authorization.startsWith("Bearer"))  throw CreateErrorMessage("Unauthorized",403)
    const bearer = authorization.split(" ")[1]

    jwt.verify(bearer,process.env.ACCESS_TOKEN_SECRET,(err,decode) => {
        
        // if(err) return res.sendStatus(403)
        if(err) throw CreateErrorMessage("Unauthorized",403)
        nex()
    })
}