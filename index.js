import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoDbConnection from './config/dbConfig.js'
import dotenv from 'dotenv'

dotenv.config()
import morgan from 'morgan'
import helmet from 'helmet'


const app = express()

// middlewares
app.use(express.json())
app.use(cors(
    {
        credentials: true,
        origin: process.env.FRONTEND_URL
    }
))
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy: false
}))

const port = process.env.PORT

import usersRoute from './Route/users.routes.js'
app.use('/api/users', usersRoute)



mongoDbConnection().then(() => {
    app.listen(port, () => {
        console.log("server is running on port " + port)
    })
})