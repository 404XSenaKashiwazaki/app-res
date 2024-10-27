import { body, check } from "express-validator"
import { Orders, OrdersItem, Products } from "../../models/Index.js"

export const validateDuplicate = async (req,res,next) => {
    let { orders } = req.body
    const uniqErr = []

    if(!orders) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    const uniqProd = await Promise.all(orders[0].orders_item.map(async (e,i)=>{
        const nameInDb = await Orders.findOne({ where: { UserId: orders[0].UserId }, include: [{  model: Products, through: { attributes:["price"], where: { ProductId: e.ProductId  }}}]})
        if(nameInDb && nameInDb?.Products.length != 0) uniqErr.push({
            "value": "",
            "msg": `Produk yang di order sudan ada`,
            "param": `orders[0].orders_item[${i}].ProductId`,
            "location": "body"
        })

        const stokProductInDb = await Products.findOne({ where: { id: e.ProductId }, attributes:["stok_produk"] })
        if(stokProductInDb.stok_produk <= e.quantity) uniqErr.push({
            "value": "",
            "msg": `Quantity melebihi stok, jadi tidak bisa diorder`,
            "param": `orders[0].orders_item[${i}].ProductId`,
            "location": "body"
        })
        
        return e.ProductId
    }))

    orders[0].orders_item.filter((e,i)=> {
        if(uniqProd.indexOf(e.ProductId) != i) uniqErr.push({
            "value": "",
            "msg": `Produk yang di order sudan ada`,
            "param": `orders[0].orders_item[${i}].ProductId`,
            "location": "body"
        })
    })

    
    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.orders =orders
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

export const ruleOders = [
    check("orders").isArray().withMessage("Data tidak valid"),
    check("orders.*.orders_item").isArray().withMessage("Data tidak valid"),
    check("orders.*.orders_item.*.ShopId").notEmpty().withMessage("Order tidak boleh kosong"),
    check("orders.*.orders_item.*.ProductId").notEmpty().withMessage("Order tidak boleh kosong"),
    check("orders.*.orders_item.*.price").notEmpty().withMessage("Order tidak boleh kosong"),
    check("orders.*.orders_item.*.quantity").notEmpty().withMessage("Order tidak boleh kosong"),
    // body("orders").custom(orders=> {
    //     const ProductId = []
    //     orders.forEach(order => {
    //         order.orders_item.forEach(item => {
    //             if(ProductId.includes(item.ProductId)) throw new Error("Produk tidak boleh duplikat")
    //             ProductId.push(item.ProductId)
    //         })
    //     });
    //     return true
    // }),
    // body("orders.*.orders_item.*.ProductId").custom(async (ProductId, { req })=> {
    //     console.log(req.body.orders[0].UserId);
        
    //     const inDbOrderItems = await Orders.findOne({ where: { UserId: req.body.orders[0].UserId }, include: [{  model: Products, through: { attributes:["price"], where: { ProductId  }}}]})
    //     console.log(inDbOrderItems);
    //     if(inDbOrderItems && inDbOrderItems?.Products) throw new Error("Produk sudah dibeli")
        
    //     return true
    // })
]


export const ruleQuantity = [
    check("quantity").trim().notEmpty().withMessage("Quantity tidak boleh kosong")
]