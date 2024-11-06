import { Op } from "sequelize"
import Users, { User_Role } from "../../models/backend/Users.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
import sequelize from "../../config/Database.js"
import bcrypt from "bcrypt"
import UsersDetails from "../../models/backend/UsersDetails.js"
import Comments from "../../models/backend/Comment.js"
import Contacts from "../../models/backend/Contact.js"
import Roles from "../../models/backend/Roles.js"
import { existsSync, unlink } from "node:fs"
import { Products } from "../../models/Index.js"
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
        fullname: { [Op.like]: `%${search}%` },
        email: { [Op.like]: `%${search}%` }
        },
        deletedAt: {
        [Op.is]: null
        }
    } }
    : { where: {
        [Op.or]: {
        fullname: { [Op.like]: `%${search}%` },
        email: { [Op.like]: `%${search}%` }
        },
        deletedAt: {
        [Op.not]: null
        }
    } }

    const whereCount = { where: { deletedAt: { [(paranoid) ? Op.is : Op.not] : null } } , paranoid: false}
    const users = await Users.findAll({...where, paranoid ,limit, offset, order: [["id"],["id","DESC"]]})   
    const totals = await Users.count(whereCount)

    const totalsCount = (search == "") ? totals : users.length
    const totalsPage = Math.ceil(totalsCount / limit)
    const totalsFilters = users.length

    return { 
        status:  200,
        message: "", 
        response: { users, page, offset, perPage: limit,totalsPage,totals, totalsFilters} 
    }
}

export const findOne = async (req) => {
  const { id } = req.params
  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, deletedAt: { [Op.is]: null} }  }}
  : { where: { [Op.and]: { id: id, deletedAt: { [Op.not]: null} }  }}

  const users = await Users.findOne({...where, include:[{ model: Roles },{model: UsersDetails}]})
  if(!users) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { users } 
  }

}
export const store = async (req) => {
  const { users } = req.body
  try {
    const response = await Promise.all(users.map(async (e,i) => {
      const saltRound = await bcrypt.genSalt(10)
      const password = await bcrypt.hash(e.password, saltRound)
      
      e.password = password
      // e.profile = req.files[i] ? req.files[i].filename  : req.body.profile 

      // e.profileUrl = req.files[i] ? `${req.protocol}://${req.hostname}:8000/profile/${req.files[i].filename}` : req.body.profileUrl
      await sequelize.transaction(async t => {
        const users = await Users.create(e,{ fields:["username","fullname","email","password","token","isActive"] , transaction: t})
        e.UserId = users.id
        // e.role = [1,2,3]
        e.role = e.role.map((role=> ({ RoleId: role,UserId: users.id })))
        await User_Role.bulkCreate(e.role, { fields:["RoleId","UserId"], transaction: t })
        await UsersDetails.create(e,{ fields:["profile","profileUrl","noHp","alamat","desc","UserId"], transaction: t})
        
      })
      return { id: e.UserId }
    }))
    
    return { 
      status:  201,
      message: `${ response.length} Data berhasil di simpan`, 
      response: { users: response  } 
    } 
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}

export const update = async (req) => {
  const { users } = req.body
  try {
    const response = (await Promise.all(users.map(async e =>  {
      const users = await Users.findOne({ where: { id: e.users_id },include: [{ model: UsersDetails, model: Roles }], paranoid: false, attributes: ["id"] })
      if(!users)  return 
      if(e.password) {
        const saltRound = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(e.password, saltRound)
        e.password = password
      }else{
        e.password = e.passwordOld
      }
  
      const roles = users?.Roles.map(roles => roles.id)
      const r = []
      
      e.role = e.role.map((role=> {
        r.push(parseInt(role))
        return { RoleId: parseInt(role),UserId: users.id }
      }))
  
      const delRoles = roles.filter(fil => (r.indexOf(fil) == - 1))
      
      await sequelize.transaction(async t => {
        const updateUsers = users.update(e,{ fields:["username","fullname","email","password","token","isActive"] , transaction: t})
        const updateRoles = User_Role.bulkCreate(e.role, { fields:["RoleId","UserId"], transaction: t,updateOnDuplicate:["RoleId","UserId"] })
        
        const updateUsersDetails = UsersDetails.update(e,{ where: { UserId: e.users_id }, fields:["profile","profileUrl","noHp","alamat","desc","UserId"], transaction: t})
        const delUsersRoles = User_Role.destroy({ where: { RoleId: delRoles, UserId: users.id }, transaction: t ,force: true })
        await Promise.all([
          updateUsers,
          updateRoles,
          updateUsersDetails,
          delUsersRoles
        ])
        
      })
      // update file profile
      if(existsSync("./public/profile/"+users?.UsersDetails?.profile) && users?.UsersDetails?.profile != "default.jpg") unlink("./public/profile/"+users?.UsersDetails?.profile, err => {
        if(err) throw CreateErrorMessage("File gagal di hapus",500)
        console.log("File berhasil di hapus")
      })
      return { id: users.id }
    }))).filter(e=> e != null)
  
    if(response.length == 0) throw new Error("Tidak ad data",404)
    return { 
      status:  201,
      message: `${response.length} Data berhasil di update`, 
      response: { users:response  } 
    }
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}

export const destroy = async (req) => {
  const { id } = req.body
  const force = req.query.permanent == "true" ? true : false
  const users = (await Users.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
 
  if(users.length == 0) throw new Error("Tidak ada data",404)
  try {
    await Users.destroy({ where: { id: id }, force })
    if(force) {
      users.forEach(e=> {
        if(existsSync("./public/images/"+e?.UsersDetails?.profile) && e?.UsersDetails?.profile != "default.png") unlink("./public/images/"+e?.UsersDetails?.profile, err => {
          if(err) throw CreateErrorMessage("File gagal di hapus",500)
          console.log("File berhasil di hapus")
        })
      })
    }
    return { 
      status:  200,
      message: `${ users.length } Data berhasil di hapus`, 
      response: { users  } 
    }
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}

export const restore = async (req) => {
  const { id } = req.body
  const users = (await Users.findAll({ where: { id: id }, paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(users.length == 0) throw new Error("Tidak ada data",404)

  try {
    await Users.restore({ where: { id: id }})
    return { 
      status:  200,
      message: `${ users.length } Data berhasil di restore`, 
      response: { users  } 
    }
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}


export const isActive = async req => {
  const { id } = req.params
  const users = await Users.findOne({ where: { id: id }, attributes: ["id"] })
  if(!users) throw new Error("Tidak ada data",404)
    
  try {
    await users.update({ isActive: true })
    return {
      status:  200,
      message: `Users berhasil di aktifkan`, 
      response: { users  } 
    }
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}

export const nonActive = async req => {
  const { id } = req.params
  const users = await Users.findOne({ where: { id: id }, attributes: ["id"] })
  
  if(!users) throw new Error("Tidak ada data",404)
  try {
    await users.update({ isActive: false })
    return {
      status:  200,
      message: `Users berhasil di nonaktifkan`, 
      response: { users  } 
    }
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}