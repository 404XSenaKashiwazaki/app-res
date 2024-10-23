import Users from "../models/backend/Users.js"
import Roles from "../models/backend/Roles.js"
import UsersDetails from "../models/backend/UsersDetails.js"
import { CreateErrorMessage } from "../utils/CreateError.js"
import sequelize from "../config/Database.js"
import bcrypt from "bcrypt"
import env from "dotenv"
import jwt from "jsonwebtoken"
//============================// 


export const find = async req => {
  const { username } = req.params
  const profiles = await Users.findOne({  where: { username: username }, include:[Roles,UsersDetails] })
  return { 
    status: 200,
    message: "",
    response: { profiles }
  }
}

export const update = async (req,res)=> {
  const users = await Users.findOne({ where: { id: req.body.id }, include:[Roles,UsersDetails] })
  if(!users) throw CreateErrorMessage("Tidak ada data",404)
  const saltRound = await bcrypt.genSalt(10)

  req.body.password = (req.body.password) ? await bcrypt.hash(req.body.password, saltRound) : users.password
  try {
    await sequelize.transaction( async transaction => {
      await users.update(req.body,{ fields:["email","password","fullname"], transaction})
      await UsersDetails.update(req.body,{ where:{ userId: req.body.id }, fields:["profile","profileUrl","noHp","alamat","desc","userId"], transaction })
    })
  
    return { 
      status: 200,
      message: "Profile berhasil di update",
      response: { users  }
    }
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}