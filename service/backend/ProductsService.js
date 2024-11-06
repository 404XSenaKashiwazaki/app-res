import { Op } from "sequelize"
import Products from "../../models/backend/Products.js"
import Categories from "../../models/backend/Categories.js"
import ImageProducts from "../../models/backend/ImageProducts.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
import sequelize from "../../config/Database.js"
import { nanoid } from 'nanoid'
import { CreateSlug } from "../../utils/CreateSlug.js"
import Shops from "../../models/backend/Shops.js"
import { existsSync, unlink } from "node:fs"
//============================// 

export const findAll = async (req) => {
  const search = req.query.search || ""
  const page = (req.query.page && typeof parseInt(req.query.page) != NaN) ? parseInt(req.query.page) : 1
  const limit = (req.query.per_page && typeof parseInt(req.query.per_page)) ? parseInt(req.query.per_page) : 10

  const offset = page > 1 ? (page * limit) - limit : 0
  const paranoid = req.query.type == "restore" ? false : true
  const where = (paranoid) 
  ? { where: {
    [Op.or]: {
      nama_produk: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.is]: null
    }
  } }
  : { where: {
    [Op.or]: {
      nama_produk: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.not]: null
    }
  } }

  const whereCount = { where: { deletedAt: { [(paranoid) ? Op.is : Op.not] : null } } , paranoid: false}
  const products = await Products.findAll({...where, include:[{ model: ImageProducts, },{ model: Categories }],paranoid ,limit, offset, order: [["id","DESC"],[ImageProducts,"id","ASC"]]})   
  const totals = await Products.count(whereCount)

  const totalsCount = (search == "") ? totals : products.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = products.length
  
  return { 
    status:  200,
    message: "", 
    response: { products, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { slug } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { slug: slug, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { slug: slug, deletedAt: { [Op.not]: null} }  } }

  const products = await Products.findOne({...where, include: [{ model: ImageProducts },{ model: Categories },{ model: Shops }], paranoid})
  if(!products) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { products } 
  }

}
export const store = async (req) => {
  const { products } = req.body
  try {
    const response = await Promise.all(products.map(async (e,i) => {
      await sequelize.transaction(async transaction => {
          e.ShopId = parseInt(e.ShopId)
          e.CategoryId = parseInt(e.CategoryId)
          const products = await Products.create(e,{ fields:["kode_produk","nama_produk","slug","stok_produk","harga_produk","status_produk","desk_produk","ShopId","CategoryId"] , transaction })

          e.ProductId = products.id
          e.image_produk = e.image_produk.map(e2=> ({ ...e2, ProductId: products.id }))

          await ImageProducts.bulkCreate(e.image_produk,{ fields: ["nama_image","url_image","ProductId"], transaction})
      })
      return { id: e.ProductId }
    }))
    
    return { 
      status:  201,
      message: `${ response.length} Data berhasil di simpan`, 
      response: { products: response  } 
    } 
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}

export const update = async (req) => {
  const { products } = req.body
  try {
    const response = (await Promise.all(products.map(async e =>  {
      const product = await Products.findOne({ where: { id: e.products_id }, include: [ImageProducts], paranoid: false, attributes: ["id"] })
      if(!product)  return 
      await sequelize.transaction(async transaction => {
        const updateProducts = product.update(e,{ fields:["kode_produk","nama_produk","slug","CategoryId","stok_produk","harga_produk","status_produk","desk_produk"] , transaction })
        e.image_produk = e.image_produk.map(e2=> ({ ...e2, ProductId: product.id, }))
        const updateImageProducts = ImageProducts.bulkCreate(e.image_produk,{ updateOnDuplicate: ["nama_image","url_image"], transaction })
        await Promise.all([
          updateProducts,
          updateImageProducts,
        ])
      })

      // update file profile
      if(existsSync("./public/products/"+e?.delImage) && e?.delImage != "gambar-produk.png") unlink("./public/products/"+e?.delImage, err => {
        if(err) throw CreateErrorMessage("File gagal di hapus",500)
        console.log("File berhasil di hapus")
      })
      return { id: e.image_produk[0] }
    }))).filter(e=> e != null)

  
    if(response.length == 0) throw new Error("Tidak ada data",404)
    return { 
      status:  201,
      message: `${response.length} Data berhasil di update`, 
      response: { products:response  } 
    }
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}

export const destroy = async (req) => {
  const { id } = req.body
  const force = req.query.permanent == "true" ? true : false
  const products = (await Products.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  
  if(products.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  await Products.destroy({ where: { id: id }, force: force })
  await ImageProducts.destroy({ where: { ProductId: id}, force })

  return { 
    status:  200,
    message: `${ products.length } Data berhasil di hapus`, 
    response: { products  } 
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const products = (await Products.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(products.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Products.restore({ where: { id: id } })
  await ImageProducts.restore({ where: { ProductId: id} })
  return { 
    status:  200,
    message: `${ products.length } Data berhasil di restore`,  
    response: { products } 
  }
}

export const createSlug = async req => {
  const { nama_produk } = req.body
  const slug = await CreateSlug(nama_produk, Products)
  
  return {
    status: 200,
    message: "",
    response: { slug }
  }
}

export const addImage = async req => {
  const { products } = req.body
  try {
    const response = await ImageProducts.bulkCreate(products,{ updateOnDuplicate: ["nama_image","url_image"] })

    // const response = products.map(e=>({...e, files: req.files}))
    products.forEach(e => {
      if(existsSync("./public/products/"+e?.delImage) && e?.delImage != "gambar-produk.png") unlink("./public/products/"+e?.delImage, err => {
        if(err) throw CreateErrorMessage("File gagal di hapus",500)
        console.log("File berhasil di hapus")
      })
    })
    return { 
      status:  201,
      message: `${ response.length} Data berhasil di simpan`, 
      response: { products: response  } 
    } 
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}