import { check } from "express-validator"
import Shops from "../../models/backend/Shops.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"

export const validateDuplicate = (req,res,next) => {
    let { shops } = req.body
    const uniqName = []    
    if(!shops) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    shops = shops.map((e,i)=> {
        const name = e.name.split(" ").map(t=> t.charAt(0).toUpperCase() + t.slice(1)).join(" ")
        uniqName.push(name)
        const logo = (req.files && req.files.length > 0) ? req.files[i].filename : (req.method == "PUT") ? e.logoOld : "default.jpg"
        const logo_url = (req.files && req.files.length > 0) ? `${req.protocol}://${req.hostname}:8000/shops/${req.files[i].filename}` : (req.method == "PUT") ? e.logo_urlOld : "http://localhost:8000/shops/default.png"
        return { ...e, name, logo, logo_url }
    })
    const uniqErr = []
    shops.filter((e,i)=> {
        if(uniqName.indexOf(e.name) != i) uniqErr.push({
            "value": e.name,
            "msg": `Nama ( ${ e.name } ) sudah digunakan`,
            "param": `shops[${i}].name`,
            "location": "body"
        })
    })

    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.shops = shops
    next()
}

export const validateUpdate = async (req,res,next) => {
    let { shops } = req.body
    const namelErr = []
    const usernameErr = []
    
    const allErr = []
    shops = await Promise.all(shops.map(async (e,i)=>{
        const nameInDb = await Shops.findOne({ where: { name: e.name }, paranoid: false })
        if(nameInDb && nameInDb.id != e.shops_id) namelErr.push({
            "value": e.name,
            "msg": `Nama (${ e.name }) sudah digunakan`,
            "param": `shops[${i}].name`,
            "location": "body"
        })
        return e
    }))
    if(usernameErr.length > 0) allErr.push(usernameErr)

    if(namelErr.length > 0) allErr.push(namelErr)
    if(allErr.length > 0) return res.status(400).json({ errors: [...allErr] })
    req.body.shops = shops

    next()   
}


export const rule = [
    check("shops.*.UserId").trim().notEmpty().withMessage("User tidak boleh kosong").custom( async (UserId,{ req }) => {
        const inDb = await Shops.findOne({ where: { UserId }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Anda sudah membuat toko ${ inDb.name }, Satu akun pengguna hanya boleh membuat satu toko`)
                return
        }
    }),
    check("shops.*.name").trim().notEmpty().withMessage("Nama tidak boleh kosong").custom( async (name,{ req }) => {
        const inDb = await Shops.findOne({ where: { name: name }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Nama ${ name } sudah di gunakan`)
                return
        }
    }),
    check("shops.*.id_card").trim().notEmpty().withMessage("Tanda pengenal tidak boleh kosong"),
    check("shops.*.comment").trim().notEmpty().withMessage("Permohonan tidak boleh kosong"),
    check("shops.*.desk").trim().notEmpty().withMessage("Deskripsi tidak boleh kosong"),
    check("shops.*.status").trim().notEmpty().withMessage("Status tidak boleh kosong"),
]

export const ruleAcc = [
    check("userid").isArray("Data tidak valid").custom((value) => {
        if (value.length === 0) {
            throw new Error("User wajib diisi");
        }
        return true;
    })
]