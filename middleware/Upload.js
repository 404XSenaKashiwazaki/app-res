import path from "path"
import multer from "multer"
import crypto from "node:crypto"
import env from "dotenv";
import { validationResult } from "express-validator"
env.config()

const storage = (name,location= "./public/post-image") => {
    return multer.diskStorage({
        destination: (req,file,cb) => {
            cb(null,location)
        },
        filename: (req,file,cb) => {
            const hasFile = crypto.createHmac("sha256",process.env.APP_NAME).update(name).digest("hex")
            cb(null,hasFile+Date.now()+path.extname(file.originalname))
        }
    })
}
const fileFilter = type => {
    return (req,file,cb) => {
        const method = req.method
        const methods = ["POST","PUT"]
    
        const ext = [".jpg",".jpeg",".png"]
        const mimeType = ["image/jpg","image/png","image/jpeg"]
        if(type == "multipel") {

        }else{
            if(file && methods.includes(method)) {
    
                if(!ext.includes(path.extname(file.originalname)) || !mimeType.includes(file.mimetype)) {
                   req.extFalse = true 
                   return cb(null,false) 
                }else{
                   return  cb(null,true)
                }
                
            }
        }
        cb(null,false)
    }
}

export const fileUpload = (req,res,next) => {
  
    const error = validationResult(req)
    if(!error.isEmpty())  {
        if(req.file && existsSync("./public/post-image/"+req.file.filename)) unlink("./public/post-image/"+req.file.filename,err=>{if(err) throw err })
        return res.status(400).json({ errors: error.array() })
    }
    if(req.size) return res.status(400).json({ errors: [{ msg: "Ukuran file yang di upload terlalu besar" }] })
    if(req.extFalse) return res.status(400).json({ errors: [ { msg: "File thumbnail tidak valid, pastikan mengupload file yang berextensi gambar" } ] })

    if(!req.file) return res.status(400).json({ errors: [{ msg: "File thumbnail tidak ada" }] })
    next()
}

const upload = (type,name,location) => {
    return multer({ fileFilter: fileFilter(type),storage: storage(name,location), limits: {
        fileSize: 1*1000*1000
    } })
}

export default upload

