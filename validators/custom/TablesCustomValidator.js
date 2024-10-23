import { check } from "express-validator"
import Tables from "../../models/backend/Tables.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"

export const validateDuplicate = async (req,res,next) => {
    let { tables } = req.body
    const uniqName = []    
    if(!tables) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    tables = tables.map((e,i)=> {
        uniqName.push(e.table_number) 
        return e
    })

    const uniqErr = []
    tables.filter(async (e,i)=> {
        if(uniqName.indexOf(e.table_number) != i ) uniqErr.push({
            "value": e.table_number,
            "msg": `Nomor ( ${ e.table_number } ) sudah digunakan`,
            "param": `tables[${i}].table_number`,
            "location": "body"
        })
    })

    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.tables = tables
    next()
}


export const validateUpdate = async (req,res,next) => {
    let { tables } = req.body
    const namelErr = []
    const usernameErr = []
    
    const allErr = []
    tables = await Promise.all(tables.map(async (e,i)=>{
        const nameInDb = await Tables.findOne({ where: { table_number: e.table_number }, paranoid: false })
        if((req.method == "PUT" && nameInDb && nameInDb.id != e.tables_id) || (req.method == "POST" && nameInDb && nameInDb.ShopId == e.ShopId)) namelErr.push({
            "value": e.table_number,
            "msg": `Nomor (${ e.table_number }) sudah digunakan`,
            "param": `tables[${i}].table_number`,
            "location": "body"
        })
        return e
    }))
    if(usernameErr.length > 0) allErr.push(usernameErr)

    if(namelErr.length > 0) allErr.push(namelErr)
    if(allErr.length > 0) return res.status(400).json({ errors: [...allErr] })
    req.body.tables = tables

    next()   
}


export const rule = [
    check("tables.*.table_number").trim().notEmpty().withMessage("Nomor tidak boleh kosong"),
    check("table_filled").trim(),
    check("tables.*.capacity").trim().notEmpty().withMessage("Kapasitas tidak boleh kosong"),
    // check("tables.*.status").trim().notEmpty().withMessage("Status tidak boleh kosong"),
]