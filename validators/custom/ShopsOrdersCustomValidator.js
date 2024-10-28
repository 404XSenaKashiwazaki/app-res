import { check } from "express-validator"
import { Orders } from "../../models/Index.js"


export const rule = [
    check("shopsordersorders.*.").isArray().withMessage("Data yang dikirimkan tidak valid").notEmpty().withMessage("Data yang dikirimkan tidak valid"),
    check("shopsordersorders.*.total_price").notEmpty().withMessage("Total bayar wajib di isi"),
    check("shopsordersorders.*.status").notEmpty().withMessage("Status wajib di isi"),
    check("shopsordersorders.*.OrderId").notEmpty().withMessage("Orders wajib di isi"),
    check("shopsordersorders.*.UserId").notEmpty().withMessage("Users wajib di isi"),
]

export const validateDuplicate = async (req,res,next) => {
    let { shopsorders } = req.body
    const uniqName = []
    const err404 = []    
    const uniqErr = []
    if(!shopsorders) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    shopsorders = await Promise.all(
    shopsorders.map(async (e,i)=> {
        uniqName.push(e.OrderId)
        const ordersInDb = await Orders.findOne({ where: {  id: e.OrderId } })
        if(!ordersInDb) {
            err404.push({
                "value": e.OrderId,
                "msg": `Tidak ada data`,
                "param": `shopsorders[${i}]`,
                "location": "body"
            })
        }
        if(ordersInDb && ordersInDb.status != "Prepared") uniqErr.push({
            "value": e.OrderId,
            "msg": `Order dengan id: ( ${ e.OrderId } ) status belum di bayar`,
            "param": `shopsorders[${i}].OrderId`,
            "location": "body"
        }) 
        return { ...e, id: e.OrderId }
    }))

    shopsorders.filter((e,i)=> {
        if(uniqName.indexOf(e.OrderId) != i) uniqErr.push({
            "value": e.OrderId,
            "msg": `Order dengan id: ( ${ e.OrderId } ) sudah ada`,
            "param": `shopsorders[${i}].OrderId`,
            "location": "body"
        })
    })

    if(uniqErr.length > 0) return res.status(400).json({ errors: uniqErr })
    if(err404.length > 0) return res.status(404).json({ errors: err404 })
    req.body.shopsorders = shopsorders
    next()
}