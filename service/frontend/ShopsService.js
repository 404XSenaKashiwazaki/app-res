import { Op } from "sequelize"
import Shops from "../../models/backend/Shops.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
import { existsSync, unlink } from "node:fs"
import { Users } from "../../models/Index.js"
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
      name: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.is]: null
    }
  } }
  : { where: {
    [Op.or]: {
      name: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.not]: null
    }
  } }

  const whereCount = { where: { deletedAt: { [(paranoid) ? Op.is : Op.not] : null } } , paranoid: false}
  const shops = await Shops.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await Shops.count(whereCount)

  const totalsCount = (search == "") ? totals : shops.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = shops.length
  
  return { 
    status:  200,
    message: "", 
    response: { shops, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { username } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { deletedAt: { [Op.is]: null} } }
  : { where: { deletedAt: { [Op.not]: null}  } }

  const shops = await Shops.findOne({...where, include:[{ model: Users, where: { username: username } }],paranoid})
  if(!shops) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { shops } 
  }

}
export const store = async (req) => {
  let { shops } = req.body
  shops = await Shops.bulkCreate(shops,{ fields: ["name","logo","status","id_card","comment","desk","UserId"] })
  return { 
    status:  201,
    message: `${shops.length} Data berhasil di simpan`, 
    response: { shops  } 
  }
}

export const update = async (req) => {
  const { shops } = req.body
  const response = (await Promise.all(shops.map(async e =>  {
    const shops = await Shops.findOne({ where: { id: e.shops_id }, paranoid: false, attributes: ["id"] })
    if(!shops) return 
    await shops.update(e,{ fields: ["name","logo","id_card","comment","desk"] })

    // update img
    if(existsSync("./public/shops/"+e.logoOld) && e.logoOld != "default.png") unlink("./public/shops/"+e.logoOld, err => {
      if(err) throw CreateErrorMessage("File gagal di hapus",500)
      console.log("File berhasil di hapus")
    }) 
    return { id: shops.id }
  }))).filter(e=> e != null)
  if(response.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  201,
    message: `${response.length} Data berhasil di update`, 
    response: { response  } 
  }
}

export const destroy = async (req) => {
  const { username } = req.params
  const shops = await Shops.findOne({ include:[{ model: Users, where: {  username  }}], paranoid: false, attributes: ["id"] })
  if(!shops) throw CreateErrorMessage("Tidak ada data",404)

  await shops.destroy()
  return { 
    status:  200,
    message: `Data berhasil di hapus`, 
    response: { shops  } 
  }
}

export const restore = async (req) => {
  const { username } = req.params
  const shops = await Shops.findOne({ include:[{ model: Users, where: {  username  }}], paranoid: false, attributes: ["id"] })
  if(!shops) throw CreateErrorMessage("Tidak ada data",404)

  await shops.restore()
  
  return { 
    status:  200,
    message: `Data berhasil di restore`,  
    response: { shops } 
  }
}

export const acc = async req => {
  const { userid } = req.body

  const shopsInDb = await Shops.findAll({ where: { UserId: userid } })
  if(shopsInDb.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  const shops = await Shops.update({ status: "Approved" }, { where: { UserId: userid } })
  
  return { 
    status:  200,
    message: `${ shops.length } Data berhasil diacc`,  
    response: { shops } 
  }
}