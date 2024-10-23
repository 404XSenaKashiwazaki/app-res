import Users, { User_Role } from "../models/backend/Users.js"
import { CreateErrorMessage } from "../utils/CreateError.js"
import sequelize from "../config/Database.js"
import UsersDetails from "../models/backend/UsersDetails.js"

import env from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import Role from "../models/backend/Roles.js"

env.config()

export const login = async (req,res) => {
    const { username, password } = req.body
    const user = await Users.findOne({where:{ username: username},include: [{ model: Role },{ model: UsersDetails }]})
    if(!user) throw CreateErrorMessage("Username tidak ditemukan, silahkan register",400)
    
    const match = await bcrypt.compare(password,user.password)
    if(!match) throw CreateErrorMessage("Username / Password anda salah",400)
    const accessToken = jwt.sign({ 
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        roles: user.Roles,
        detailUsers: user.UsersDetail
    },
        process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: "30s"})

    const refreshToken = jwt.sign({ 
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        roles: user.Roles,
        detailUsers: user.UsersDetail
    },
        process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: "1d"})
    res.cookie("jwt",refreshToken,{httpOnly:true,maxAge: 60*60*24*1000})
    await user.update({token: refreshToken})
      
    return {
        status: 201,
        message: "Login berhasil",
        response: { accessToken }
    }
}

export const register = async (req,res) => {
    let { fullname, username, email, password } = req.body
    username.toLowerCase()

    const saltRound = await bcrypt.genSalt(10)
    password = await bcrypt.hash(password,saltRound)
    try {
        let users
        await sequelize.transaction(async transaction => {
            users = await Users.create({fullname,email,username,password,token: ""},{ transaction })
            await User_Role.create({ roleId: 3, userId: users.id },{ transaction })
            await UsersDetails.create({ userId: users.id,alamat: "" },{ transaction })
        })

        const accessToken = jwt.sign({ 
            id: users.id,
            username: users.username,
            fullname: users.fullname,
            email: users.email,
            roles: users.Roles,
            detailUsers: users.UsersDetail
        },
            process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "30s"})
    
        const refreshToken = jwt.sign({ 
            id: users.id,
            username: users.username,
            fullname: users.fullname,
            email: users.email,
            roles: users.Roles,
            detailUsers: users.UsersDetail
        },
            process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "1d"})
        res.cookie("jwt",refreshToken,{httpOnly:true,maxAge: 60*60*24*1000})

        await users.update({token: refreshToken})  
        return {
            status: 201,
            message: "Regiser akun berhasil",
            response: { accessToken }
        }
    } catch (error) {
        throw CreateErrorMessage(error.message,error.statusCode)
    }
}

export const logout = async (req,res) => {
    const refreshToken = req.cookies.jwt
    if(!refreshToken) throw CreateErrorMessage("Tidak ditemukan data",401)
    const user = await Users.findOne({where: {token: refreshToken}})
    
    if(!user) throw CreateErrorMessage("Tidak ditemukan data",403)
    await user.update({token: ""})
    res.clearCookie("jwt")

    return {
        status: 200,
        message: "Logout berhasil",
        response: { user: user.username }
    }
}