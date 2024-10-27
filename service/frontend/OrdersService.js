import Orders from "../../models/front/Orders.js"
import {OrdersItem, Products} from "../../models/Index.js"
import { CreateErrorMessage } from "../../utils/CreateError.js"
import sequelize from "../../config/Database.js"
import Users from "../../models/backend/Users.js"
import { Op, or } from "sequelize"
//============================// 
export const findAll = async (req) => {
  const search = req.query.search || ""
  const username = req.params.username || ""
  const page = (req.query.page && typeof parseInt(req.query.page) != NaN) ? parseInt(req.query.page) : 1
  const limit = (req.query.per_page && typeof parseInt(req.query.per_page)) ? parseInt(req.query.per_page) : 10

  const offset = page > 1 ? (page * limit) - limit : 0
  const paranoid = req.query.type == "restore" ? false : true

  const users = await Users.findOne({ where: { username }, paranoid: false })  
  if(!users) throw CreateErrorMessage("Tidak ada data",404)
  const where = (paranoid) 
  ? { where: {
    [Op.or]: {
      total_price: { [Op.like]: `%${search}%` }
    },
    [Op.and]:{
      UserId: users.id
    },
    deletedAt: {
      [Op.is]: null
    }
  } }
  : { where: {
    [Op.or]: {
      total_price: { [Op.like]: `%${search}%` }
    },
    [Op.and]:{
      UserId: users.id
    },
    deletedAt: {
      [Op.not]: null
    }
  } }

  const whereCount = { where: { deletedAt: { [(paranoid) ? Op.is : Op.not] : null } } , paranoid: false}
  const orders = await Orders.findAll({...where, paranoid ,limit, offset, order: [["id","DESC"]]})   
  const totals = await Orders.count(whereCount)

  const totalsCount = (search == "") ? totals : orders.length
  const totalsPage = Math.ceil(totalsCount / limit)
  const totalsFilters = orders.length
  
  return { 
    status:  200,
    message: "", 
    response: { orders, page, offset, limit,totalsPage,totals, totalsFilters } 
  }
}

export const findOne = async (req) => {
  const { id, username } = req.params
  
  const users = await Users.findOne({ where: { username }, paranoid: false })  
  if(!users) throw CreateErrorMessage("Tidak ada data",404)

  const paranoid = req.query.type == "restore" ? false : true
  const where = paranoid 
  ? { where: { [Op.and]: { id: id, UserId: users.id, deletedAt: { [Op.is]: null} }  } }
  : { where: { [Op.and]: { id: id, UserId: users.id, deletedAt: { [Op.not]: null} }  } }

  const orders = await Orders.findOne({...where, paranoid})
  if(!orders) throw CreateErrorMessage("Tidak ada data",404)
  return { 
    status:  200,
    message: "", 
    response: { orders } 
  }

}
export const store = async req =>  {
  const { orders } = req.body
  try {

    const response = await Promise.all(orders.map(async (e,i) => {
      e.status = "Pending"

        await sequelize.transaction(async t => {
          const order = await Orders.create(e,{ fields:["total_price","status","UserId"], transaction: t})
          e.OrderId = order.id
          // // e.role = [1,2,3]
          e.orders_item = e.orders_item.map((item=> ({ ...item,OrderId: order.id })))
          console.log(e.orders_item);
          
          await OrdersItem.bulkCreate(e.orders_item,{ fields:["quantity","price","ShopId","OrderId","ProductId"], transaction: t})
       
         
        })
      return { id: e.OrderId }
    }))
    
    return { 
      status:  201,
      message: `${ response.length} Data berhasil di simpan`, 
      response: { response: response  } 
    } 
  } catch (error) {
    throw CreateErrorMessage(error.message, error.statusCode)
  }
}

export const update = async req => {
  const { orders } = req.body
  const response = (await Promise.all(orders.map(async e=> {
    const orders = await Orders.findOne({ where: { id: e.orders_id }, include:[OrdersItem],paranoid: false, attributes: ["id"] })
    if(!orders) return
    const delOrderItems = orders?.OrdersItem.map(prod => (prod.ProductId != e.ProductId) ? prod.ProductId : null).filter(item => item != null)

    await sequelize.transaction(async transaction => {
      const orders = await orders.update(orders,{ fields: ["total_price","status","UserId"], transaction })
      e.OrderId = orders.id
      await OrdersItem.bulkCreate(orders,{ updateOnDuplicate:["order_date","quantity","price","OrderId","ProductId"], transaction })
      if(delOrderItems.length > 0) orders.removeOrdersItem(delOrderItems)
    })
    
    return { id: e.OrdersId }
  }))).filter(e=> e != null)
  if(response.length == 0) throw CreateErrorMessage("Tidak ada data",404)
  
    return { 
    status:  201,
    message: `${response.length} Tanggapan berhasil dikirim`, 
    response: { response } 
  }
}

export const destroy = async req =>  {
  const { orderid, username } = req.params
  console.log(req.params);
  
  // const orders = []
  const orders = (await Orders.findAll({ where: { id: orderid }, include:[{ model: Users, where: { username: username }}], paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(orders.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Orders.destroy({ where: { id: orderid },force: true })
  return { 
    status:  200,
    message: `${ orders.length } Data berhasil di hapus`, 
    response: { orders  } 
  }
}

export const quantity = async req => {
  const { username, orderid, productid, type} = req.params || ""

  const dataInDb = await Users.findOne({ where: { username }, include:[{ model: Orders, include:[{ model: Products, through: { where: { OrderId: orderid, ProductId: productid} } }], where: { id: orderid } }] })

  if(!dataInDb || 
    (dataInDb && dataInDb.Orders.length == 0) || 
    (dataInDb.Orders[0].Products.length == 0))  throw CreateErrorMessage("Tidak ada data",404)
  
    const quantityInDb = dataInDb.Orders[0].Products[0].OrdersItems.quantity
    const stokInDb = dataInDb.Orders[0].Products[0].stok_produk
    console.log(stokInDb);
    
  if(quantityInDb == 1 && type == "decrement") throw CreateErrorMessage("Quantity tidak bisa dikurangi lagi",400)
  if(stokInDb <= quantityInDb && type == "increment") throw CreateErrorMessage("Quantity tidak bisa ditambah lagi",400);
    (type == "increment") 
  ? await OrdersItem.increment("quantity",{
    where: { OrderId: orderid, ProductId: productid }
  }) 
  : await OrdersItem.decrement("quantity",{ 
    where: { OrderId: orderid, ProductId: productid}
  })

  return { 
    status:  200,
    message: `Quantity berhasil ${ type == "increment" ? `ditambahkan` : `dikurangi` }`, 
    response: req.params
  }

}

export const cancel = async req => {
  const { orderid, username } = req.params
  console.log(req.params);
  
  // const orders = []
  const orders = (await Orders.findAll({ where: { id: orderid }, include:[{ model: Users, where: { username: username }}], paranoid: false, attributes: ["id"] })).filter(e=> e != null)
  if(orders.length == 0) throw CreateErrorMessage("Tidak ada data",404)

  await Orders.destroy({ where: { id: orderid },force: false })
  await Orders.runHooks("afterCancelOrders")
  
  return { 
    status:  200,
    message: `${ orders.length } Data berhasil di hapus`, 
    response: { orders  } 
  }
}