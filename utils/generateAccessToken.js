
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

async function generateAccessToken(userId) {
    const token = await jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: '5h'
    })
    return token

}

export default generateAccessToken
