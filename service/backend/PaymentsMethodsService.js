import { Op } from "sequelize"
import PaymentsMethods from "../../models/backend/PaymentMethods.js"
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
  const payments_methods = await PaymentsMethods.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await PaymentsMethods.count(whereCount)

  const totalsCount = (search == "") ? totals : payments_methods.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = payments_methods.length
  
  return { 
    status:  200,
    message: "", 
    response: { payments_methods, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  } }

  const payments_methods = await PaymentsMethods.findOne({...where, paranoid})
  if(!payments_methods) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { payments_methods } 
  }

}
export const store = async (req) => {
  let { payments_methods } = req.body
  payments_methods =  await PaymentsMethods.bulkCreate(payments_methods,{ fields: ["name","desk"] })
  return { 
    status:  201,
    message: `${payments_methods.length} Data berhasil di simpan`, 
    response: { payments_methods  } 
  }
}

export const update = async (req) => {
  const { payments_methods } = req.body
  const response = (await Promise.all(payments_methods.map(async e =>  {
    const payments_methods = await PaymentsMethods.findOne({ where: { id: e.payments_methods_id }, paranoid: false, attributes: ["id"] })
    if(!payments_methods) return 
    await payments_methods.update(e,{ fields: ["name","desk"] })

    return { id: payments_methods.id }
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

  const payments_methods = (await PaymentsMethods.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(payments_methods.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await PaymentsMethods.destroy({ where: { id: id }, force: force })
  return { 
    status:  200,
    message: `${ payments_methods.length } Data berhasil di hapus`, 
    response: { payments_methods  } 
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const payments_methods = (await PaymentsMethods.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  
  if(payments_methods.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  await PaymentsMethods.restore({ where: { id: id } })
  
  return { 
    status:  200,
    message: `${ payments_methods.length } Data berhasil di restore`,  
    response: { payments_methods } 
  }
}
