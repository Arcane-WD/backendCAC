import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.log("Err: ", err);
            throw err;
        });
        app.listen(port, () => {
            console.log(`Server is running at port: ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
    });

/*
import express from "express";
const app = express();


( async () => {
    try{
        await mongoose.ConnectionStates(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    }catch(error){
        console.log("Error: ", error)
        throw err
    }
})()


*/
