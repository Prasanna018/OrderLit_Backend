import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'


async function generateRefreshToken(userId) {
    const token = await jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: "7d"


    })
    const updateToken = await UserModel.updateOne({ _id: userId }, {
        refresh_token: token
    })
    return token

}

export default generateRefreshToken