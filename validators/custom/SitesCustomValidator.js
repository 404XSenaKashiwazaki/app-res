import { check } from "express-validator"
import Sites from "../../models/backend/Sites.js"

export const rule = [
    check("title").trim().notEmpty().withMessage("Title tidak boleh kosong").custom( async (title,{ req }) => {
        const inDb = await Sites.findOne({ where: { title: title }  })
        if(req.method == "PUT"){
            if(inDb && inDb.id != req.body.id) throw new Error(`Title ${ title } sudah di gunakan`)
            return
        }
        if(req.method == "POST"){
            if(inDb) throw new Error(`Title ${ title } sudah di gunakan`)
            return
        }
        throw new Error("Data dari inputan sites tidak valid")
    }),
    check("about").trim().notEmpty().withMessage("About tidak boleh kosong").isLength({ max: 200 }),
    check("dmca").trim().notEmpty().withMessage("Dmca tidak boleh kosong").isLength({ max: 500 }),
    check("privacy_police").trim().notEmpty().withMessage("Privacy police tidak boleh kosong").isLength({ max: 500 }),
]