import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()


if (!process.env.MONGO_DB_URI) {
    throw new Error(
        "please provide mongo db uri in .env file"
    )
}

async function mongoDbConnection() {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("db is connected")

    } catch (error) {
        console.log("error in mongo db connection", error);
        process.exit(1)

    }

}
export default mongoDbConnection;