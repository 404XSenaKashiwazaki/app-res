import { check } from "express-validator"
import PaymentsMethods from "../../models/backend/PaymentMethods.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"

export const validateDuplicate = (req,res,next) => {
    let { payments_methods } = req.body
    const uniqName = []    
    if(!payments_methods) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    payments_methods = payments_methods.map((e,i)=> {
        const name = e.name.split(" ").map(t=> t.toUpperCase()).join(" ")
        uniqName.push(name)
        return { ...e, name }
    })
    const uniqErr = []
    payments_methods.filter((e,i)=> {
        if(uniqName.indexOf(e.name) != i) uniqErr.push({
            "value": e.name,
            "msg": `Nama Payments ( ${ e.name } ) sudah digunakan`,
            "param": `payments_methods[${i}].name`,
            "location": "body"
        })
    })

    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.payments_methods = payments_methods
    next()
}

export const validateUpdate = async (req,res,next) => {
    let { payments_methods } = req.body
    const namelErr = []
    const usernameErr = []
    
    const allErr = []
    payments_methods = await Promise.all(payments_methods.map(async (e,i)=>{
        const nameInDb = await PaymentsMethods.findOne({ where: { name: e.name }, paranoid: false })
        if(nameInDb && nameInDb.id != e.payments_methods_id) namelErr.push({
            "value": e.name,
            "msg": `Nama Payments(${ e.name }) sudah digunakan`,
            "param": `payments_methods[${i}].name`,
            "location": "body"
        })
        return e
    }))
    if(usernameErr.length > 0) allErr.push(usernameErr)

    if(namelErr.length > 0) allErr.push(namelErr)
    if(allErr.length > 0) return res.status(400).json({ errors: [...allErr] })
    req.body.payments_methods = payments_methods

    next()   
}


export const rule = [
    check("payments_methods.*.name").trim().notEmpty().withMessage("Nama tidak boleh kosong").custom( async (name,{ req }) => {
        const inDb = await PaymentsMethods.findOne({ where: { name: name }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Nama ${ name } sudah di gunakan`)
            return
        }
    }),
    check("payments_methods.*.desk").trim().notEmpty().withMessage("Deskripsi tidak boleh kosong"),
]