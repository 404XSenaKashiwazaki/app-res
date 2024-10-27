import { Op } from "sequelize"
import Shops from "../../models/backend/Shops.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
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
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  } }

  const shops = await Shops.findOne({...where, paranoid})
  if(!shops) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { shops } 
  }

}
export const store = async (req) => {
  let { shops } = req.body
  shops = await Shops.bulkCreate(shops,{ fields: ["name","logo","status","desk","UserId"] })
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
    await shops.update(e,{ fields: ["name","logo","status","desk"] })

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
  const { id } = req.body
  const force = req.query.permanent == "true" ? true : false

  const shops = (await Shops.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(shops.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Shops.destroy({ where: { id: id }, force: force })
  return { 
    status:  200,
    message: `${ shops.length } Data berhasil di hapus`, 
    response: { shops  } 
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const shops = (await Shops.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  
  if(shops.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  await Shops.restore({ where: { id: id } })
  
  return { 
    status:  200,
    message: `${ shops.length } Data berhasil di restore`,  
    response: { shops } 
  }
}
