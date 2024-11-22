import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function connectToDB(){
try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log('Mongo Db connected !',DB_NAME)
}
 catch (error) {
    console.log("ERR:",error)
}
}

export default connectToDB