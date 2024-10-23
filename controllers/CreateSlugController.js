import Post from "../models/backend/Series.js";
import slugify from "slugify"

export const index = async (req,res) => {
    try {
       
        const date = new Date()
        let { title } = req.body
        let slug = slugify(title,{ lower: true })  
        const matchSlug = await Post.findOne({
            where: {
                slug
            }
        })
        console.log(matchSlug);
        if (matchSlug) {
            slug = slug+date.getMinutes()+date.getMilliseconds()
            if(req.body.method == "PUT" && req.body.post_id != matchSlug.id ){
                
            }
        }
        res.status(200).json({ slug })
    } catch (error) {
        console.log(error)
        res.status(500).json({ errors: [{ msg: error.message }] })
    }
}