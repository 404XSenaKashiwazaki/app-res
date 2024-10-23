import { Op } from "sequelize"
import Categories from "../../models/backend/Categories.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
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
      nama: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.is]: null
    }
  } }
  : { where: {
    [Op.or]: {
      nama: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.not]: null
    }
  } }

  const whereCount = { where: { deletedAt: { [(paranoid) ? Op.is : Op.not] : null } } , paranoid: false}
  const categories = await Categories.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await Categories.count(whereCount)

  const totalsCount = (search == "") ? totals : categories.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = categories.length
  
  return { 
    status:  200,
    message: "", 
    response: { categories, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  } }

  const categories = await Categories.findOne({...where, paranoid})
  if(!categories) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { categories } 
  }

}
export const store = async (req) => {
  const { categories } = req.body
  await Categories.bulkCreate(categories,{ fields: ["nama","desc"] })
  return { 
    status:  201,
    message: `${categories.length} Data berhasil di simpan`, 
    response: { categories  } 
  }
}

export const update = async (req) => {
  const { categories } = req.body
  const response = (await Promise.all(categories.map(async e =>  {
    const categories = await Categories.findOne({ where: { id: e.categories_id }, paranoid: false, attributes: ["id"] })
    if(!categories) return 
    await categories.update(e,{ fields: ["nama","desc"] })

    return { id: categories.id }
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

  const categories = (await Categories.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(categories.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Categories.destroy({ where: { id: id }, force: force })
  return { 
    status:  200,
    message: `${ categories.length } Data berhasil di hapus`, 
    response: { categories  } 
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const categories = (await Categories.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  
  if(categories.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  await Categories.restore({ where: { id: id } })
  
  return { 
    status:  200,
    message: `${ categories.length } Data berhasil di restore`,  
    response: { categories } 
  }
}
