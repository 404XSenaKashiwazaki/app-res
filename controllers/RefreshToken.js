import { refreshToken as refreshTokenService } from "../service/RefreshTokenService.js"
import { CreateResponse } from "../utils/CreateResponse.js"


export const RefreshToken = async (req, res,next) => {
     try {
          const response = await refreshTokenService(req,res)
          CreateResponse(res,response)
      } catch (error) {
         next(error)
      }
}