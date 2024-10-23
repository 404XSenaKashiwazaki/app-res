import {
    findAll as findAllService,
    findOne as findOneService,
    destroy as destroyService,
    restore as restoreService
} from "../../service/backend/CommentsService.js"
import { CreateResponse } from "../../utils/CreateResponse.js"

export const findAll = async (req,res,next) => {
    try {
        const response = await findAllService(req)
        CreateResponse(res,response)
    } catch (error) {
        next(error)
    }
}

export const findOne = async (req,res,next) => {
    try {
        const response = await findOneService(req)
        CreateResponse(res,response)
    } catch (error) {
        next(error)
    }
}

export const destroy = async (req,res,next) => {
    try {
        const response = await destroyService(req)
        CreateResponse(res,response)
    } catch (error) {
        next(error)
    }
}

export const restore = async (req,res,next) => {
    try {
        const response = await restoreService(req)
        CreateResponse(res,response)
    } catch (error) {
        next(error)
    }
}
