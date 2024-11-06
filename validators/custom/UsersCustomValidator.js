import { check } from "express-validator"
import Users from "../../models/backend/Users.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
import Roles from "../../models/backend/Roles.js"
import { Op } from "sequelize"


export const validateDuplicate = (req,res,next) => {
    let { users } = req.body
    const uniqEmail = []
    const uniqUsername = []
    
    if(!users) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    users = users.map((e,i)=> {
        const username = e.username.split(" ").map(t=> t.toLowerCase()).join("")
        uniqUsername.push(username)
        const profile = (req.files && req.files.length > 0) ? req.files[i].filename : (req.method == "PUT") ? e.profileOld : "default.jpg"
        
        uniqEmail.push(e.email)
        console.log({ files: e.files });
        
        const profileUrl = (req.files && req.files.length > 0) ? `${req.protocol}://${req.hostname}:8000/profile/${req.files[i].filename}` : (req.method == "PUT") ? e.profile_urlOld : "http://localhost:8000/profile/default.jpg"        
        const fullname = e.fullname.split(" ").map(t=> t.charAt(0).toUpperCase() + t.slice(1)).join(" ")

        return { ...e, username, fullname, profile, profileUrl }
    })
    const uniqErr = []
    
    users.filter((e,i)=> {
        if(uniqUsername.indexOf(e.username) != i) uniqErr.push({
            "value": e.username,
            "msg": `Username ( ${ e.username } ) sudah digunakan`,
            "param": `users[${i}].username`,
            "location": "body"
        })
        if(uniqEmail.indexOf(e.email) != i) uniqErr.push({
            "value": e.email,
            "msg": `Email ( ${ e.email } ) sudah digunakan`,
            "param": `users[${i}].email`,
            "location": "body"
        })
    })

    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.users = users
    next()
}

export const validateRoles = async (req,res,next) => {
    let { users } = req.body

    const roleErr = []
    const roleEmpty = []
    users = await Promise.all(users.map(async (e,i)=>{
        const roles = e.role

        if(roles.length == 0 || roles == " ") {
            roleEmpty.push({
                "value": " ",
                "msg": `Role tidak boleh kosong`,
                "param": `users[${i}].role`,
                "location": "body"
            })
            return e
        }
            
        const inRoles = await Roles.findAll({ where: { id: { [Op.in]: roles } }, attributes: ["id"] })
        if(inRoles.length == 0) roleErr.push({ 
            "value": roles.join(", "),
            "msg": `Roles ( ${ roles.join(", ") }) tidak valid`,
            "param": `users[${i}].role`,
            "location": "body"
        })
        return { ...e, role: inRoles.map(e=> e.id) }
    }))

    if(roleErr.length > 0 || roleEmpty.length > 0) return res.status(400).json({ errors: [...roleErr,...roleEmpty] })
        
    req.body.users = users
    next()   
}

export const validateUpdate = async (req,res,next) => {
    let { users } = req.body
    const emailErr = []
    const usernameErr = []
    
    const allErr = []
    users = await Promise.all(users.map(async (e,i)=>{
        const emailInDb = await Users.findOne({ where: { email: e.email }, paranoid: false })
        if(emailInDb && emailInDb.id != e.users_id) emailErr.push({
            "value": e.email,
            "msg": `Email (${ e.email }) sudah digunakan`,
            "param": `users[${i}].email`,
            "location": "body"
        })
        return e
    }))
    users = await Promise.all(users.map(async (e,i)=>{
        const usernameInDb = await Users.findOne({ where: { username: e.username }, paranoid: false })
        if(usernameInDb && usernameInDb.id != e.users_id) usernameErr.push({
            "value": e.username,
            "msg": `Username (${ e.username }) sudah digunakan`,
            "param": `users[${i}].username`,
            "location": "body"
        })
        return e
    }))

    if(usernameErr.length > 0) allErr.push(usernameErr)
    if(emailErr.length > 0) allErr.push(emailErr)
    if(allErr.length > 0) return res.status(400).json({ errors: [...allErr] })
        
    req.body.users = users
    next()   
}

export const rule = [
    check("users.*.fullname")
    .trim()
    .notEmpty().withMessage("Fullname tidak boleh kosong")
    .isString(),

    check("users.*.email")
    .trim()
    .notEmpty().withMessage("Email tidak boleh kosong")
    .isEmail().withMessage("Email tidak valid").custom( async (email,{ req }) => {
        const inDb = await Users.findOne({ where: { email: email }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Email ${ email } sudah digunakan`)
            return
        }
    }),

    check("users.*.username")
    .trim()
    .notEmpty().withMessage("Username tidak boleh kosong")
    .isLength({ min: 5}).withMessage("Username minimal 5 karakter")
    .isLength({ max: 12 }).withMessage("Username makasimal 12 karakter")
    .custom( async (username,{ req }) => {
        const inDb = await Users.findOne({ where: { username: username }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Username ${ username } sudah di gunakan`)
            return
        }
    }),

    check("users.*.password")
    .trim()
    .custom((password, { req }) => {
        const method = req.method
        if(method == "PUT") return true

        if(!password) throw new Error("Password tidak boleh kosong")
        if(password.length < 5) throw new Error("Password minimal 5 karakter")
        
        if(password.length > 16) throw new Error("Password makasimal 16 karakter")
        return true
    }),
    check("users.*.isActive")
    .trim(),
    check("users.*.noHp")
    .trim(),
    check("users.*.alamat")
    .trim(),
    check("users.*.desc")
    .trim(),
]