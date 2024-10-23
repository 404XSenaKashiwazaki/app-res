import { Op } from "sequelize"
import Roles from "../../models/backend/Roles.js"
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
  const roles = await Roles.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await Roles.count(whereCount)

  const totalsCount = (search == "") ? totals : roles.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = roles.length
  
  return { 
    status:  200,
    message: "", 
    response: { roles, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  } }

  const roles = await Roles.findOne({...where, paranoid})
  if(!roles) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { roles } 
  }

}
export const store = async (req) => {
  const { roles } = req.body
  await Roles.bulkCreate(roles,{ fields: ["name","desk"] })
  return { 
    status:  201,
    message: `${roles.length} Data berhasil di simpan`, 
    response: { roles  } 
  }
}

export const update = async (req) => {
  const { roles } = req.body
  const response = (await Promise.all(roles.map(async e =>  {
    const roles = await Roles.findOne({ where: { id: e.roles_id }, paranoid: false, attributes: ["id"] })
    if(!roles) return 
    await roles.update(e,{ fields: ["name","desk"] })

    return { id: roles.id }
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

  const roles = (await Roles.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(roles.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Roles.destroy({ where: { id: id }, force: force })
  return { 
    status:  200,
    message: `${ roles.length } Data berhasil di hapus`, 
    response: { roles  } 
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const roles = (await Roles.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  
  if(roles.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  await Roles.restore({ where: { id: id } })
  
  return { 
    status:  200,
    message: `${ roles.length } Data berhasil di restore`,  
    response: { roles } 
  }
}
