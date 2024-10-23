import { check } from "express-validator"
import Reservations from "../../models/front/Reservations.js"
import Users from "../../models/backend/Users.js"

export const rule = [
    check("reservation_time").trim().notEmpty().withMessage("Watku tidak boleh kosong"),
    check("status").trim().notEmpty().withMessage("Status tidak boleh kosong"),
    check("TableId").trim().notEmpty("Meja tidak boleh kosong"),
    check("UserId").trim().notEmpty("User tidak boleh kosong").custom( async (UserId,{ req }) => {
        const inDb = await Reservations.findOne({ where: { UserId }, include: [Users], paranoid: false })
        if(req.method == "PUT"){
            if(inDb.TableId != req.body.TableId) throw new Error(`Data ${ inDb.fullname } sudah digunakan`)
            return
        }
        if(req.method == "POST"){
            if(inDb) throw new Error(`Data ${ inDb.fullname } sudah digunakan`)
            return
        }
    }),
]