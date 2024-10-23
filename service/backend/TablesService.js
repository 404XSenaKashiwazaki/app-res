import { Op } from "sequelize"
import Tables from "../../models/backend/Tables.js"
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
      table_number: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.is]: null
    }
  } }
  : { where: {
    [Op.or]: {
      table_number: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.not]: null
    }
  } }

  const whereCount = { where: { deletedAt: { [(paranoid) ? Op.is : Op.not] : null } } , paranoid: false}
  const tables = await Tables.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await Tables.count(whereCount)

  const totalsCount = (search == "") ? totals : tables.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = tables.length
  
  return { 
    status:  200,
    message: "", 
    response: { tables, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  } }

  const tables = await Tables.findOne({...where, paranoid})
  if(!tables) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { tables } 
  }

}
export const store = async (req) => {
  let { tables } = req.body
  tables = await Tables.bulkCreate(tables,{ fields: ["table_number","table_filled","capacity","ShopId"] })
  return { 
    status:  201,
    message: `${tables.length} Data berhasil di simpan`, 
    response: { tables  } 
  }
}

export const update = async (req) => {
  const { tables } = req.body
  const response = (await Promise.all(tables.map(async e =>  {
    const tables = await Tables.findOne({ where: { id: e.tables_id }, paranoid: false, attributes: ["id"] })
    if(!tables) return 
    await tables.update(e,{ fields: ["table_number","table_filled","capacity"] })

    return { id: tables.id }
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

  const tables = (await Tables.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(tables.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Tables.destroy({ where: { id: id }, force: force })
  return { 
    status:  200,
    message: `${ tables.length } Data berhasil di hapus`, 
    response: { tables  } 
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const tables = (await Tables.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  
  if(tables.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  await Tables.restore({ where: { id: id } })
  
  return { 
    status:  200,
    message: `${ tables.length } Data berhasil di restore`,  
    response: { tables } 
  }
}
