import { Op } from "sequelize"
import Payments from "../../models/front/Payments.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
import { Orders, Users } from "../../models/Index.js"
//============================// 

export const findAll = async (req) => {
  const search = req.query.search || ""
  const page = (req.query.page && typeof parseInt(req.query.page) != NaN) ? parseInt(req.query.page) : 1
  const limit = (req.query.per_page && typeof parseInt(req.query.per_page)) ? parseInt(req.query.per_page) : 10

  const { username } = req.params
  const offset = page > 1 ? (page * limit) - limit : 0
  const paranoid = req.query.type == "restore" ? false : true

  const users = await Users.findOne({ where: { username: username } })
  if(!users) throw CreateErrorMessage("Tidak ada data",404);


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
  const payments = await Payments.findAll({...where, include: [{ model: Orders, where: { UserId: users.id } }], paranoid ,limit, offset, order: [["id","DESC"]]})   
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

  const { username } = req.params
  const users = await Users.findOne({ where: { username: username } })
  if(!users) throw CreateErrorMessage("Tidak ada data",404);

  const payments = await Payments.findOne({...where, include: [{ model: Orders, where: { UserId: users.id } }],  paranoid})
  if(!payments) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { payments } 
  }

}
export const store = async (req) => {
  const { payments } = req.body
  payments[0].status = "Paid"
  payments[0].return_amount = payments[0].kembalian
  await Payments.upsert(payments[0],{ fields: ["amount","bill_amount","return_amount","PaymentsMethodId","payment_date","OrderId","status"], orderid: payments[0].OrderId })
  return { 
    status:  201,
    message: `Pembayaran berhasil`, 
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
    message: `Pembayaran berhasil dicancel`, 
    response: { payments  } 
  }
}
