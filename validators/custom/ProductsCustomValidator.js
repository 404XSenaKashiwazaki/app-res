import { body, check } from "express-validator"
import Products from "../../models/backend/Products.js" 
import { CreateErrorMessage } from "../../utils/CreateError.js"

export const validateDuplicate = (req,res,next) => {
    let { products } = req.body
    const uniqKodeProduk = []    
    if(!products) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    products = products.map((e,i)=> {
        uniqKodeProduk.push(e.kode_produk)
        const delImage = (req.files && req.files.length > 0) ? e.image_produk[0].namaImageOld : "gambar-produk.png" 
        const nama_image = (req.files && req.files.length > 0) ? req.files[i].filename : (req.method == "PUT") ? e.image_produk[0].namaImageOld : "gambar-produk.png"
        const url_image = (req.files && req.files.length > 0) ? `${req.protocol}://${req.hostname}:8000/products/${req.files[i].filename}` : (req.method == "PUT") ? e.image_produk[0].urlImageOld : "http://localhost:8000/products/gambar-produk.png"        
        console.log({delImage});
        console.log(e.image_produk);
        
        return { ...e, delImage,image_produk: [{ ...e.image_produk[0],nama_image, url_image }] }
    })
    const uniqErr = []

    products.filter((e,i)=> {
     

        if(uniqKodeProduk.indexOf(e.kode_produk) != i) uniqErr.push({
            "value": e.kode_produk,
            "msg": `Kode produk ( ${ e.kode_produk } ) sudah digunakan`,
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
    "msg": `Image produk tidak boleh kosong`,
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
            "msg": `Kode produk (${ e.kode_produk }) sudah digunakan`,
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
    check("products").isArray().withMessage("Data tidak valid"),
    check("products.*.kode_produk").trim().notEmpty().withMessage("Kode produk tidak boleh kosong").custom( async (kode_produk,{ req }) => {
        const inDb = await Products.findOne({ where: { kode_produk: kode_produk }, paranoid: false })
        if(req.method == "POST"){
            if(inDb) throw new Error(`Kode produk ${ kode_produk } sudah di gunakan`)
            return
        }
    }),
    check("products.*.nama_produk").trim().notEmpty().withMessage("Nama produk tidak boleh kosong"),
    check("products.*.slug").trim().notEmpty().withMessage("Slug produk tidak boleh kosong"),
    check("products.*.stok_produk").trim().notEmpty().withMessage("Stok produk tidak boleh kosong").isInt().withMessage("Stok produk harus angka"),
    check("products.*.harga_produk").trim().notEmpty().withMessage("Harga produk tidak boleh kosong").isInt().withMessage("Harga produk harus angka"),
    check("products.*.status_produk").trim().notEmpty().withMessage("Status produk tidak boleh kosong"),
    check("products.*.CategoryId").trim().notEmpty().withMessage("Kategori produk tidak boleh kosong"),
    check("products.*.desk_produk").trim().notEmpty().withMessage("Deskripsi produk tidak boleh kosong"),
    check("products.*.ShopId").trim().notEmpty().withMessage("Anda belum membuat toko, Jadi tidak bisa menambahkan produk"),
]

export const ruleAddImage = [
    check("products").isArray().withMessage("Data tidak valid"),
    check("products.*.ProductId").notEmpty().withMessage("Data produk tidak valid"),
]

export const validateAddImage = (req,res,next) => {
    let { products } = req.body  
    if(!products) throw CreateErrorMessage("Permintaan anda tidak valid",400)
    products = products.map((e,i) => {
        const regex = /\[([0-9]+)\]/;
        const fieldname = req.files[0].fieldname
        const fieldIndex = fieldname.match(regex)
    
        const nama_image = (fieldIndex[1] == i) ? req.files[0]?.filename :  e.namaImageOld
        const url_image = (fieldIndex[1] == i) ?  `${req.protocol}://${req.hostname}:8000/products/${req.files[0]?.filename}` : e.urlImageOld      
        e.delImage = (fieldIndex[1] == i) ? e.namaImageOld : "gambar-produk.png" 
        return { ...e, nama_image, url_image  }
    })

    req.body.products = products
    next()
}