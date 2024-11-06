import Roles from "../models/backend/Roles.js"
import Users from "../models/backend/Users.js"
import UsersDetail from "../models/backend/UsersDetails.js"
import { CreateErrorMessage } from "../utils/CreateError.js"

import jwt from "jsonwebtoken"
import env from "dotenv"
import Shops from "../models/backend/Shops.js"

env.config()

export const refreshToken = async (req,res) => {
    const refreshToken = req.cookies.jwt
    if(!refreshToken) throw CreateErrorMessage("Unauthorized",401)
    const user = await Users.findOne({ 
        where: { token: refreshToken }, 
        include: [{ 
            model: Roles, attributes:["id","name","desk"], 
            through: { attributes:["RoleId","UserId"] } 
        },{ 
            model: UsersDetail, attributes: ["id","UserId","desc","noHp","profile","profileUrl"] 
        },{
            model: Shops, attributes:["id","name","logo","logo_url","desk","status","UserId"]
        }] 
    })

    if(!user) throw CreateErrorMessage("No content",403)
    const roles = user.Roles
    const navigate = roles.map(t => (t.name.trim().toLowerCase().includes("admin","penjual")) ? "/api/dashboard" : "/")
    return jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,decode) => {
        if((err) ||(decode.email !== user.email) || (decode.username !== user.username)) throw CreateErrorMessage("No content",403)
        
        const accessToken = jwt.sign({ 
            id: decode.id,
            username: decode.username,
            fullname: decode.fullname,
            email: decode.email,
            roles: user.Roles,
            detailUsers: user.UsersDetail,
            shops: user.Shop,
            navigate: navigate[0]
        }, 
            process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30s" })
        return { 
            status:  200,
            message: ``, 
            response: { accessToken  } 
        } 
    })
}