import { check } from "express-validator"
import Reservations from "../../models/front/Reservations.js"
import Users from "../../models/backend/Users.js"
import { Tables } from "../../models/Index.js"

export const rule = [
    check("reservation_time").trim().notEmpty().withMessage("Watku tidak boleh kosong"),
    check("TableId").trim().notEmpty().withMessage("Meja tidak boleh kosong"),
    check("UserId").trim().notEmpty().withMessage("User tidak boleh kosong").custom( async (UserId,{ req }) => {
        const inDb = await Reservations.findOne({ where: { UserId }, paranoid: false })

        if(req.method == "PUT"){
            if(inDb && parseInt(req.body.reservations_id) != inDb.id) throw new Error(`Data sudah digunakan`)
            return
        }
        if(req.method == "POST"){
            if(inDb) throw new Error(`Data sudah digunakan`)
            return
        }
    }),
]

export const validateDuplicate = async (req,res,next) => {
    let orders = req.body
    const uniqErr = []

    if(!orders) throw CreateErrorMessage("Permintaan anda tidak valid",400)

    const stokProductInDb = await Tables.findOne({ where: { id: orders.TableId }, attributes:["capacity","table_filled"] })
    
    if(stokProductInDb.table_filled >= stokProductInDb.capacity) uniqErr.push({
        "value": "",
        "msg": `Jumlah kursi penuh`,
        "param": `TableId`,
        "location": "body"
    })

        // const nameInDb = await Orders.findOne({ where: { UserId: orders[0].UserId }, include: [{  model: Products, through: { attributes:["price"], where: { ProductId: e.ProductId  }}}]})
        // if(nameInDb && nameInDb?.Products.length != 0) uniqErr.push({
        //     "value": "",
        //     "msg": `Produk yang di order sudan ada`,
        //     "param": `orders[0].orders_item[${i}].ProductId`,
        //     "location": "body"
        // })


    
    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.orders =orders
    next()
}