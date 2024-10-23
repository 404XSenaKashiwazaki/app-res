import { check } from "express-validator"
import { OrdersItem } from "../../models/Index.js"

export const validateDuplicate = async (req,res,next) => {
    let { orders } = req.body
    const uniqErr = []

    if(!orders) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    orders = await Promise.all(orders.map(async (e,i)=>{
        const nameInDb = await OrdersItem.findOne({ where: { OrderId: e.OrderId, ProductId: e.ProductId }, paranoid: false })
        if(nameInDb) uniqErr.push({
            "value": "",
            "msg": `Produk yang di order sudan ada`,
            "param": `orders[${i}].orders_item`,
            "location": "body"
        })
        return e
    }))
    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.users = users
    next()
}
export const validateItemProducts = async (req,res,next) => {
    let { orders } = req.body

    const roleErr = []
    const roleEmpty = []
    orders = await Promise.all(orders.map(async (e,i)=>{
        const orders_item = e.orders_item

        if(orders_item.length == 0 || orders_item == " ") {
            roleEmpty.push({
                "value": " ",
                "msg": `Order Produk tidak boleh kosong`,
                "param": `orders[${i}].orders_item`,
                "location": "body"
            })

            return e
        }
        const subTotal = orders_item.map(order =>order.price * order.quantity).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        return { ...e, total_price: subTotal  }
    }))

    if(roleErr.length > 0 || roleEmpty.length > 0) return res.status(400).json({ errors: [...roleErr,...roleEmpty] })
        
    req.body.orders = orders
    next()   
}


export const rule = [
    check("orders.*.UserId").trim().notEmpty().withMessage("Users tidak boleh kosong"),
    check("orders.*.total_price").trim().notEmpty().withMessage("Total Harga tidak boleh kosong"),
    check("orders.*.status").trim().notEmpty().withMessage("Status tidak boleh kosong"),
]