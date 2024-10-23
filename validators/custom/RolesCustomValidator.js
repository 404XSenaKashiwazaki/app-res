import { check } from "express-validator"
import Roles from "../../models/backend/Roles.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"

export const validateDuplicate = (req,res,next) => {
    let { roles } = req.body
    const uniqName = []    
    if(!roles) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    roles = roles.map((e,i)=> {
        const name = e.name.split(" ").map(t=> t.toUpperCase()).join(" ")
        uniqName.push(name)
        return { ...e, name }
    })
    const uniqErr = []
    roles.filter((e,i)=> {
        if(uniqName.indexOf(e.name) != i) uniqErr.push({
            "value": e.name,
            "msg": `Nama ( ${ e.name } ) sudah digunakan`,
            "param": `roles[${i}].name`,
            "location": "body"
        })
    })

    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.roles = roles
    next()
}

export const validateUpdate = async (req,res,next) => {
    let { roles } = req.body
    const namelErr = []
    const usernameErr = []
    
    const allErr = []
    roles = await Promise.all(roles.map(async (e,i)=>{
        const nameInDb = await Roles.findOne({ where: { name: e.name }, paranoid: false })
        if(nameInDb && nameInDb.id != e.roles_id) namelErr.push({
            "value": e.name,
            "msg": `Nama (${ e.name }) sudah digunakan`,
            "param": `roles[${i}].name`,
            "location": "body"
        })
        return e
    }))
    if(usernameErr.length > 0) allErr.push(usernameErr)

    if(namelErr.length > 0) allErr.push(namelErr)
    if(allErr.length > 0) return res.status(400).json({ errors: [...allErr] })
    req.body.roles = roles

    next()   
}


export const rule = [
    check("roles.*.name").trim().notEmpty().withMessage("Nama tidak boleh kosong").custom( async (name,{ req }) => {
        const inDb = await Roles.findOne({ where: { name: name }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Nama ${ name } sudah di gunakan`)
            return
        }
    }),
    check("roles.*.desk").trim().notEmpty().withMessage("Deskripsi tidak boleh kosong"),
]