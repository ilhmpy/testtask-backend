import { MongoClient } from "mongodb";
import { User } from "./securityConfig/user";

const db = "TestTask-db";
const url = `mongodb+srv://${User.name}:${User.password}@cluster0.15eqf.mongodb.net/${db}?retryWrites=true&w=majority`;

export const connect = async () => { 
    let client;
    try {        
        client = await MongoClient.connect(url);
    } catch(e) {
        console.log(e);
    };
    if (client) {
        return client.db(db);
    };
};