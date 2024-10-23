import {
    find as findService,
    update as updateService
} from "../service/ProfilesService.js"
import { CreateResponse } from "../utils/CreateResponse.js"

export const find = async (req,res,next) => {
    try {
        const response = await findService(req)
        CreateResponse(res,response)
    } catch (error) {
        next(error)
    }
}

export const update = async (req,res,next) => {
    try {
        const response = await updateService(req,res)
        CreateResponse(res,response)
    } catch (error) {
        next(error)
    }
}
