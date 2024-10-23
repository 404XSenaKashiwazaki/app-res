import { validationResult } from "express-validator"
import Post from "../models/backend/Series.js"



const valSlugAlreadyExits =  async (val, { req }) => {
    const post = await Post.findOne({ where: { slug: val } })
    
    if((post && req.method == "PUT" && req.params.slug != post.slug) || (post)) throw Error("Slug Sudah ada")
    return true
} 


export {
    valSlugAlreadyExits,
}