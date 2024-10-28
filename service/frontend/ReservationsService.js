import { Op } from "sequelize"
import Tables from "../../models/backend/Tables.js"
import Reservations from "../../models/front/Reservations.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
import sequelize from "../../config/Database.js"
//============================// 

export const findAll = async (req) => {
  const search = req.query.search || ""
  const page = (req.query.page && typeof parseInt(req.query.page) != NaN) ? parseInt(req.query.page) : 1
  const limit = (req.query.per_page && typeof parseInt(req.query.per_page)) ? parseInt(req.query.per_page) : 10

  const offset = page > 1 ? (page * limit) - limit : 0
  const paranoid = req.query.type == "restore" ? false : true
  const where = (paranoid) 
  ? { where: {
    deletedAt: {
      [Op.is]: null
    }
  } }
  : { where: {
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
  req.body.status = "Confirmed"
  const reservations = await Reservations.create(req.body,{ fields: ["reservation_time","status","TableId","UserId"]})
  return { 
    status:  201,
    message: `Data berhasil disimpan`, 
    response: { reservations  } 
  }
}

export const update = async (req) => {
  const {  reservations_id, reservation_time, status, TableId, UserId, TableIdOld } = req.body
  const reservations = await Reservations.findOne({ where: { id: reservations_id }, paranoid: false, attributes: ["id"] })
  if(!reservations) throw CreateErrorMessage("Tidak ada data",404)
  const response = await sequelize.transaction(async transaction => {
      const res = await Reservations.update({ status, TableId, UserId },{ where: { id: reservations_id }, fields: ["status","TableId","UserId"], transaction, tabeleidold: TableIdOld})
      if(res[0] == 1) {
        await Tables.increment("table_filled",{ where: { id: TableId } , transaction })
      }
      return res
  })
  return { 
    status:  201,
    message: `Data berhasil diupdate`, 
    response: { response  } 
  }
}

export const destroy = async (req) => {
  const { id } = req.body
  const force = req.query.permanent == "true" ? true : false

  const reservations = (await Reservations.findAll({ where: { id: id }, paranoid: false, attributes: ["id","TableId"] })).filter(e=> e != null).map(e => e.TableId)
  if(reservations.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  console.log(reservations);

  
  const response = await sequelize.transaction(async transaction => {
    const res = await Reservations.destroy({ where: { id: id }, transaction, force })
    
    if(res == 1) {
      await Tables.decrement("table_filled",{ where: { id: reservations },transaction })
    }
    console.log(res);
    
    return res
})
  return { 
    status:  200,
    message: `${ response } Data berhasil dihapus`, 
    response: { response  } 
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const reservations = (await Reservations.findAll({ where: { id: id }, paranoid: false, attributes: ["id","TableId"] })).filter(e=> e != null).map(e => e.TableId)
  
  if(reservations.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  const response = await sequelize.transaction(async transaction => {
    const res = await Reservations.restore({ where: { id: id }, transaction })
    
    if(res == 1) {
      await Tables.increment("table_filled",{ where: { id: reservations },transaction })
    }
    return res
})
  return { 
    status:  200,
    message: `${ response.length } Data berhasil di restore`,  
    response: { response } 
  }
}
