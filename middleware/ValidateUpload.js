import path from "path"
import multer from "multer"
import crypto from "node:crypto"
import env from "dotenv";
import { validationResult } from "express-validator"
import { CreateErrorMessage } from "../utils/CreateError.js"
env.config()

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

const storage = (filename,location) => {
    return multer.diskStorage({
        destination: (req,file,cb) => {
            cb(null,location)
        },
        filename: (req,file,cb) => {
            const hasFile = crypto.createHmac("sha256",process.env.APP_NAME).update(filename).digest("hex")
            cb(null,hasFile+Date.now()+path.extname(file.originalname))
        }
    })
} 

const fileFilter = (data,name) => {
    return (req,file,cb) => {
        // console.log(req.file);
        const method = req.method
        const methods = ["POST","PUT"]
        
        const ext = [".jpg",".jpeg",".png"]
        const mimeType = ["image/jpg","image/jpeg","image/png"]
        
        req.notValidExt = false
        if(file && methods.includes(method)) {
            if(!ext.includes(path.extname(file.originalname)) && !mimeType.includes(file.mimetype)) {
                    const index = file.fieldname.match(/\[([0-9]+)\]/)[1]
                    const err = new Error("file tidak valid")
                    err.notValidExt = true 
                    err.status = 400
                    err.param = `${data}[${index}].${name}` 
                   return cb(err) 
                }else{
                    return cb(null,true)
                }
            }
            
           return cb(null,false)
        }
}


export const fileUploads =  (data="users",name="file",location="./public/") => {
   return multer({ fileFilter: fileFilter(data,name),storage: storage(name,location), limits: {
        fileSize: 5*1000*1000
    } })
}



const upload = (name="file",type="single",location="./public/") => {
    return multer({ fileFilter: fileFilter,storage: storage(name,location), limits: {
        fileSize: 1*1000*1000
    } })
}


export default upload

