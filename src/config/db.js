const mongoose = require("mongoose");
const dotenv = require('dotenv');

let isConnected = false;
dotenv.config()

// console.log('mong', process.env.MONGO_URI)
const connectDB = async () => {
    mongoose.set("strictQuery", true);

    if (isConnected) {
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/brunati");
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(err) {

        console.log( "Issue in DB COnnection");
        console.error("err msg " , err.message);
        process.exit(1); 

    }
};

module.exports = connectDB;

