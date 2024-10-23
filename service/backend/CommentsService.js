import { Op } from "sequelize"
import Comment from "../../models/backend/Comment.js"
import User from "../../models/backend/Users.js"
import UserDetail from "../../models/backend/UsersDetails.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
//============================// 

export const findAll = async req => {
  const search = req.query.search || ""
  const page = (req.query.page && typeof parseInt(req.query.page) != NaN) ? parseInt(req.query.page) : 1
  const limit = (req.query.per_page && typeof parseInt(req.query.per_page)) ? parseInt(req.query.per_page) : 10

  const offset = page > 1 ? (page * limit) - limit : 0
  const paranoid = req.query.type == "restore" ? false : true
  const where = (paranoid) 
  ? { where: {
    [Op.or]: {
      username: { [Op.like]: `%${search}%` },
      email: { [Op.like]: `%${search}%`},
      content: { [Op.like]: `%${search}%`}
    },
    deletedAt: {
      [Op.is]: null
    }
  } }
  : { where: {
    [Op.or]: {
      username: { [Op.like]: `%${search}%` },
      email: { [Op.like]: `%${search}%`},
      content: { [Op.like]: `%${search}%`}
    },
    deletedAt: {
      [Op.not]: null
    }
  } }

  
  const whereCount = { where: { deletedAt: { [(paranoid) ? Op.is : Op.not] : null } } , paranoid: false}
  const comments = await Comment.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await Comment.count(whereCount)

  const totalsCount = (search == "") ? totals : comments.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = comments.length

  return { 
    status:  200,
    message: "", 
    response: { comments, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async req => {
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  
  const include = [{model: User,attributes: ["username","email","fullname"],include:[{ model: UserDetail, attributes: ["profileUrl","alamat","noHp"] }]}]
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  } }

  const comments = await Comment.findOne({...where, paranoid, include})
  if(!comments) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { comments } 
  }

}

export const destroy = async req => {
  const { id } = req.body
  const force = req.query.permanent == "true" ? true : false
  const comments = (await Comment.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
 
  if(comments.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  await Comment.destroy({ where: { id: id }, force: force })
  return { 
    status:  200,
    message: `${ comments.length } Data berhasil di hapus`, 
    response: { comments  } 
  }
}

export const restore = async req => {
  const { id } = req.body
  const comments = (await Comment.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(comments.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Comment.restore({ where: { id: id } })
  return { 
    status:  200,
    message: `${ comments.length } Data berhasil di restore`,  
    response: { comments } 
  }
}
