import {
    find as findService,
    store as storeService,
    update as updateService,
    destroy as destroyService,
    restore as restoreService
} from "../../service/backend/SitesService.js"
import { CreateResponse } from "../../utils/CreateResponse.js"

export const find = async (req,res,next) => {
    try {
        const response = await findService(req)
        return res.status(200).json({...response})
    } catch (error) {
        next(error)
    }
}

export const store = async (req,res,next) => {
    try {
        const response = await storeService(req)
        CreateResponse(res, response)
    } catch (error) {
        next(error)
    }
}

export const update = async (req,res,next) => {
    try {
        const response = await updateService(req)
        CreateResponse(res, response)
    } catch (error) {
        next(error)
    }
}

export const destroy = async (req,res,next) => {
    try {
        const response = await destroyService(req)
        CreateResponse(res, response)
    } catch (error) {
        next(error)
    }
}

export const restore = async (req,res,next) => {
    try {
        const response = await restoreService(req)
        CreateResponse(res, response)
    } catch (error) {
        next(error)
    }
}
