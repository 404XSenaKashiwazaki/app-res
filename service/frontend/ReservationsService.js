import { Op } from "sequelize"
import Tables from "../../models/backend/Tables.js"
import Reservations from "../../models/front/Reservations.js"
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
  const reservations = await Reservations.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await Reservations.count(whereCount)

  const totalsCount = (search == "") ? totals : reservations.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = reservations.length
  
  return { 
    status:  200,
    message: "", 
    response: { reservations, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  } }

  const reservations = await Reservations.findOne({...where, paranoid})
  if(!reservations) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { reservations } 
  }

}
export const store = async (req) => {
  const { reservations } = req.body
  await Reservations.create(reservations,{ fields: ["reservation_time","status","TableId","UserId"]})
  return { 
    status:  201,
    message: `${reservations.length} Data berhasil disimpan`, 
    response: { reservations  } 
  }
}

export const update = async (req) => {
  const { id, reservation_time, status, TableId, UserId } = req.body
  const reservations = await Reservations.findOne({ where: { id: id }, paranoid: false, attributes: ["id"] })
  const response = await reservations.update({ reservation_time, status, TableId, UserId },{fields: ["reservation_time","status","TableId","UserId"]})

  if(!reservations) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  201,
    message: `Data berhasil diupdate`, 
    response: { response  } 
  }
}

export const destroy = async (req) => {
  const { id } = req.body
  const force = req.query.permanent == "true" ? true : false

  const reservations = (await Reservations.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(reservations.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Reservations.destroy({ where: { id: id }, force: force })
  return { 
    status:  200,
    message: `${ reservations.length } Data berhasil dihapus`, 
    response: { reservations  } 
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const reservations = (await Reservations.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  
  if(reservations.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  await Reservations.restore({ where: { id: id } })
  
  return { 
    status:  200,
    message: `${ reservations.length } Data berhasil di restore`,  
    response: { reservations } 
  }
}
