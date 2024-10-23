import { 
    register as registerService,
    login as loginService,
    logout as logoutService
} 
from "../service/AuthService.js"
import { CreateResponse } from "../utils/CreateResponse.js"

export const login = async (req,res,next) => {
    try {
        const response = await loginService(req,res)
        CreateResponse(res,response)
    } catch (error) {
       next(error)
    }
}

export const register = async (req, res,next) => {
    try {
        const response = await registerService(req,res)
        CreateResponse(res,response)
    } catch (error) {
       next(error)
    }
}

export const logout = async (req,res,next) => {
    try {
        const response = await logoutService(req,res)
        CreateResponse(res,response)
    } catch (error) {
       next(error)
    }
}