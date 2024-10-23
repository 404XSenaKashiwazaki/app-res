import multer from "multer"
import { existsSync, unlink } from "node:fs"
import path, { basename } from "path"

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,"./public/post-image")
    },
    filename: (req,file,cb) => {
        if(file) cb(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname))
        
    }
})

const fileFilter = (req,file,cb) => {
    const method = req.method
    const methods = ["POST","PUT"]

    const ext = [".jpg",".jpeg",".png"]
    const mimeType = ["image/jpg","image/png","image/jpeg"]

    if(!file && method == "POST"){
        cb(new Error("Silahkan upload thumbnail!!")) 
    } else if(file && methods.includes(method)) {

        if(file.size > 1024 * 2) return cb(new Error("Ukuran file Thumbnail terlalu besar")) 
        if(!ext.includes(path.extname(file.originalname)) && !mimeType.includes(file.mimetype)) return cb(new Error("Thumbnail harus file gambar yang valid")) 
        if(method == "PUT" && existsSync("./"+req.body.fileOld)) unlink("."+req.body.fileOld,(err) => {
            if(err) return cb(new Error(err))
            console.log({ msg: "Success deleted file: "+req.body.fileOld })
        })
    }
  
    cb(null,true)
}


const Upload = multer({storage,fileFilter,limits: 1024 * 1024 })


export {
    Upload
}