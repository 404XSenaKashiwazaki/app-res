import { body, check } from "express-validator"
import Products from "../../models/backend/Products.js" 
import { CreateErrorMessage } from "../../utils/CreateError.js"

export const validateDuplicate = (req,res,next) => {
    let { products } = req.body
    const uniqKodeProduk = []    
    if(!products) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    products = products.map((e,i)=> {
        uniqKodeProduk.push(e.kode_produk)
        return e
    })
    const uniqErr = []

    products.filter((e,i)=> {
     

        if(uniqKodeProduk.indexOf(e.kode_produk) != i) uniqErr.push({
            "value": e.kode_produk,
            "msg": `Kode Produk ( ${ e.kode_produk } ) sudah digunakan`,
            "path": `products[${i}].kode_produk`,
            "location": "body"
        })
    })

    if(uniqErr.length > 0) return res.status(400).json({ errors: [...uniqErr] })
    req.body.products = products
    next()
}

export const validateImageProduk = async (req,res,next) => {
    let { products } = req.body

    const roleErr = []
    const roleEmpty = []
    products = await Promise.all(products.map(async (e,i)=>{
        const imgProduk = e.image_produk
        
        if(!imgProduk && imgProduk.length == 0) {
            roleEmpty.push(templateErr(i))
            return e
        }
        imgProduk.map(item=>{
            if(!item.nama_image || item.nama_image == " " || item.nama_image.length == 0) roleEmpty.push(templateErr(i))
            return 
        })
        return e
    }))

    if(roleEmpty.length > 0) return res.status(400).json({ errors: [...roleEmpty] })
        
    req.body.products = products
    next()   
}

const templateErr = (i) => ({
    "value": " ",
    "msg": `Image Produk tidak boleh kosong`,
    "param": `products[${i}].image_produk`,
    "location": "body"
})

export const validateUpdate = async (req,res,next) => {
    let { products } = req.body
    const namelErr = []

    const allErr = []
    products = await Promise.all(products.map(async (e,i)=>{
        const nameInDb = await Products.findOne({ where: { kode_produk: e.kode_produk }, paranoid: false })
        if(nameInDb && nameInDb.id != e.products_id) namelErr.push({
            "value": e.kode_produk,
            "msg": `Kode Produk (${ e.kode_produk }) sudah digunakan`,
            "path": `products[${i}].kode_produk`,
            "location": "body"
        })
        return e
    }))

    if(namelErr.length > 0) allErr.push(namelErr)
    if(allErr.length > 0) return res.status(400).json({ errors: [...allErr] })
    req.body.products = products

    next()   
}


export const rule = [
    check("products.*.kode_produk").trim().notEmpty().withMessage("Kode Produk tidak boleh kosong").custom( async (kode_produk,{ req }) => {
        const inDb = await Products.findOne({ where: { kode_produk: kode_produk }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Kode Produk ${ kode_produk } sudah di gunakan`)
            return
        }
    }),
    check("products.*.nama_produk").trim().notEmpty().withMessage("Nama Produk tidak boleh kosong"),
    check("products.*.slug").trim().notEmpty().withMessage("Slug Produk tidak boleh kosong"),
    check("products.*.jenis_produk").trim().notEmpty().withMessage("Jenis Produk tidak boleh kosong"),
    check("products.*.stok_produk").trim().notEmpty().withMessage("Stok Produk tidak boleh kosong"),
    check("products.*.harga_produk").trim().notEmpty().withMessage("Harga Produk tidak boleh kosong"),
    check("products.*.status_produk").trim().notEmpty().withMessage("Status Produk tidak boleh kosong"),
    check("products.*.desk_produk").trim().notEmpty().withMessage("Deskripsi Produk tidak boleh kosong"),
    check("products.*.ShopId").trim().notEmpty().withMessage("Toko Produk tidak boleh kosong"),
]