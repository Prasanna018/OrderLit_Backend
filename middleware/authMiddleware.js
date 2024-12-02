import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req?.header?.authorization?.split(" ")[1];
        // console.log(token)
        if (!token) {
            return res.status(400).json({
                message: "provide token",
                error: true,
                success: false
            })
        }

        const decode = await jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        if (!decode) {
            return res.stats(400).json({
                message: "unauthorized access",
                success: false,
                error: true
            })
        }
        req.userId = decode.id
        next();

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })

    }


}

export default authMiddleware;