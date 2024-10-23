import slugify from "slugify";
import Post from "../models/Post.js";

export const ValidateSlug = async (req,res,next) => {
    const date = new Date()
    let slug =  slugify(req.body.title,{ lower: true })
    
    const data = await Post.findOne({ where: { slug} })
  
    if(data) {
        req.body.slug = slug+date.getMinutes()+date.getMilliseconds()
    }else{
        req.body.slug = slug
    }
    next()
}