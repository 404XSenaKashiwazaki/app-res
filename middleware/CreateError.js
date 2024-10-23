const CreateError = (err,req,res,next) => {
    const status = err.status || 500
    const message    = [{ msg: err.message }] ||  [{ msg: "Permintaan anda tidak dapat di prosses" }] 
    const stack      = err.stack

    const errors = (err.notValidExt) ? [{ 
        location: "body",
        msg: err.message,
        param: err.param,
        value: ""
     }] : message
    console.log("message ==== ",message);
    console.log("stack ==== ",stack);

    res.status(status).json({
        status: status,
        errors: errors,
        stack: stack
    })
}

export default CreateError