import { validationResult } from "express-validator"
import { unlink } from "fs"

const validate = validations => {
    return async (req,res,nex) => {
        
        for(let validate of validations){
            const res = await validate.run(req)
            if(res.errors.length) break
        }
        
        const error = validationResult(req)

        if(error.isEmpty()) return nex()

        if(req?.files?.length > 0) req.files.map(e=>{ 
            unlink(`${e.destination}/${e.filename}`,(err) => {
                if(err) throw err
                console.log("Delete file success");
            })
        })        
        res.status(400).json({ errors: error.array() })
        
    }
}

export { validate }