import { check } from "express-validator"
import Users from "../../models/backend/Users.js"


export const afterValidate = (req,res,next) => {
    const username = req.body.username.split(" ").map(t=> t.toLowerCase()).join("")
    const profile = (req.file) ? req.file.filename : (req.method == "PUT") ? req.body.profileOld : "default.jpg"
    const profileUrl = (req.file) ? `${req.protocol}://${req.hostname}:8000/images/${req.file.filename}` : (req.method == "PUT") ? req.body.profile_urlOld : "http://localhost:8000/images/default.png"        
   
    const fullname = req.body.fullname.split(" ").map(t=> t.charAt(0).toUpperCase() + t.slice(1)).join(" ")
    req.body.username = username
    req.body.profile = profile
    req.body.profileUrl = profileUrl
    
    req.body.fullname = fullname
    next()
}

export const rule = [
    check("username").trim().notEmpty().withMessage("Username tidak boleh kosong").custom( async (username,{ req }) => {
        const inDb = await Users.findOne({ where: { username: username }  })
        if(req.method == "PUT"){
            if(inDb && inDb.id != req.body.id) throw new Error(`Username ${ username } sudah di gunakan`)
            return
        }
        if(req.method == "POST"){
            if(inDb) throw new Error(`Username ${ username } sudah di gunakan`)
            return
        }
        throw new Error("Data dari inputan users tidak valid",400)
    }),
    check("email").trim().notEmpty().withMessage("Email tidak boleh kosong").custom( async (email,{ req }) => {
        const inDb = await Users.findOne({ where: { email: email }  })
        if(req.method == "PUT"){
            if(inDb && inDb.id != req.body.id) throw new Error(`Email ${ email } sudah di gunakan`)
            return
        }
        if(req.method == "POST"){
            if(inDb) throw new Error(`Email ${ email } sudah di gunakan`)
            return
        }
        throw new Error("Data dari inputan email tidak valid",400)
    }),
    check("fullname").trim().notEmpty().withMessage("Fullname tidak boleh kosong"),
    check("password").trim().custom( async (password, { req }) => {
        if(password && password.length > 16) throw new Error("Passsword maksimal 16 karakter")
        if(password && password.length < 5) throw new Error("Password minimal 5 karakter")
    }),
]