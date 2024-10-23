import { check } from "express-validator"
import Categories from "../../models/backend/Categories.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"

export const validateDuplicate = (req,res,next) => {
    let { categories } = req.body
    const uniqName = []    
    if(!categories) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    categories = categories.map((e,i)=> {
        const nama = e.nama.split(" ").map(t=> t.toUpperCase()).join(" ")
        uniqName.push(nama)
        return { ...e, nama }
    })
    const uniqErr = []
    categories.filter((e,i)=> {
        if(uniqName.indexOf(e.nama) != i) uniqErr.push({
            "value": e.nama,
            "msg": `Nama Categori ( ${ e.nama } ) sudah digunakan`,
            "param": `categories[${i}].nama`,
            "location": "body"
        })
    })

    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.categories = categories
    next()
}

export const validateUpdate = async (req,res,next) => {
    let { categories } = req.body
    const namelErr = []
    const usernameErr = []
    
    const allErr = []
    categories = await Promise.all(categories.map(async (e,i)=>{
        const nameInDb = await Categories.findOne({ where: { nama: e.nama }, paranoid: false })
        if(nameInDb && nameInDb.id != e.categories_id) namelErr.push({
            "value": e.nama,
            "msg": `Nama Categori (${ e.nama }) sudah digunakan`,
            "param": `categories[${i}].nama`,
            "location": "body"
        })
        return e
    }))
    if(usernameErr.length > 0) allErr.push(usernameErr)

    if(namelErr.length > 0) allErr.push(namelErr)
    if(allErr.length > 0) return res.status(400).json({ errors: [...allErr] })
    req.body.categories = categories

    next()   
}


export const rule = [
    check("categories.*.nama").trim().notEmpty().withMessage("Nama Categori tidak boleh kosong").custom( async (name,{ req }) => {
        const inDb = await Categories.findOne({ where: { nama: name }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Nama Categori ${ name } sudah di gunakan`)
            return
        }
    }),
    check("categories.*.desc").trim().notEmpty().withMessage("Deskripsi tidak boleh kosong"),
]