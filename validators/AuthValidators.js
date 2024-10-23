import { check } from "express-validator"
import User from "../models/backend/Users.js"


export const username = (async (username, { req }) => {
    const inDb = await User.findOne({ where: { username: username }, paranoid: false  })
    if(inDb) throw new Error(`Username ${ username } sudah di gunakan`)
    return true
})

const valPasswordConf = (value,{ req }) => {
    if(value != req.body.password) throw new Error("Konfirmasi password / password tidak sama")
    return true
}

const valEmailAlreadyExits = async (value) => {
    const user = await User.findOne({ where: { email: value }, paranoid: false })
    if(user) throw new Error("Email sudah terdaftar")
    return true
}

const valUsernameAlreadyExits = async (value) => {
    const user = await User.findOne({ where: { username: value }, paranoid: false })
    if(user) throw new Error("Username sudah terdaftar")
    return true
}


export const ruleLogin = [
    check("username").trim().notEmpty().withMessage("Username wajib di isi"),
    check("password").trim().notEmpty().withMessage("Password tidak boleh kosong").isLength({ min: 5 }).withMessage("Password minimal 5 karakter")
]
export const ruleRegister = [
    check("fullname").trim().notEmpty().withMessage("Fullname wajib di isi"),
    check("username").trim().notEmpty().withMessage("Fullname wajib di isi").custom(valUsernameAlreadyExits),
    check("email").trim().isEmail().withMessage("Email tidak valid").custom(valEmailAlreadyExits),
    check("password").trim().isLength({ min: 5 }).withMessage("Password minimal 5 karakter"),
    check("konf_password").trim().isLength({ min: 5 }).withMessage("Konfirmasi password minimal 5 karakter").custom(valPasswordConf)
]
