
export const handleUpload = (req,res,next) => {
    const title = req.body.title.split(" ").map(e => e.toUpperCase()).join(" ")
    const logo = (req.files && req.files.length > 0) ? req.files[0].filename : (req.method == "PUT") ? req.body.logoOld : "default.png" 
    const logo_url = (req.files && req.files.length > 0) ? `${req.protocol}://${req.hostname}:8000/sites/${req.files[0].filename}` : (req.method == "PUT") ? req.body.logo_urlOld : "http://localhost:8000/sires/default.png"
    
    req.body.logo = logo
    req.body.logo_url = logo_url
    req.body.title = title

    next()
}