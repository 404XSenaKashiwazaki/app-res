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

