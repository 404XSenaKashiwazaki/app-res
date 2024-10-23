import slugify from "slugify"

export const CreateSlug = async (value,Model) => {
    const date = new Date()
    let slug =  slugify(value,{ lower: true })
    
    const data = await Model.findOne({ where: { slug: slug } })
    return (data) ? slug+date.getMinutes()+date.getMilliseconds() : slug
}