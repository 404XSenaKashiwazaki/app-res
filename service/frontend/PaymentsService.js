import { Op } from "sequelize"
import Payments from "../../models/front/Payments.js"
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
      amount: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.is]: null
    }
  } }
  : { where: {
    [Op.or]: {
      amount: { [Op.like]: `%${search}%` }
    },
    deletedAt: {
      [Op.not]: null
    }
  } }

  const whereCount = { where: { deletedAt: { [(paranoid) ? Op.is : Op.not] : null } } , paranoid: false}
  const payments = await Payments.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await Payments.count(whereCount)

  const totalsCount = (search == "") ? totals : payments.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = payments.length
  
  return { 
    status:  200,
    message: "", 
    response: { payments, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  } }

  const payments = await Payments.findOne({...where, paranoid})
  if(!payments) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { payments } 
  }

}
export const store = async (req) => {
  const { payments } = req.body
  payments.status = "Paid"
  await Payments.create(payments,{ fields: ["amount","PaymentMethodId","payment_date","OrderId","status"] })
  return { 
    status:  201,
    message: `${payments.length} Data berhasil disimpan`, 
    response: { payments  } 
  }
}

export const destroy = async (req) => {
  const { id } = req.body

  const payments = (await Payments.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(payments.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Payments.update({ status: "Canceled" },{ where: { OrderId: id } })
  return { 
    status:  200,
    message: `${ payments.length } Data berhasil dicancel`, 
    response: { payments  } 
  }
}
