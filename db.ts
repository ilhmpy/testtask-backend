import { MongoClient } from "mongodb";
import { User } from "./securityConfig/user";

const db = "TestTask-db";
const url = `mongodb+srv://${User.name}:${User.password}@cluster0.15eqf.mongodb.net/${db}?retryWrites=true&w=majority`;

export const connect = async () => {
    const client = await MongoClient.connect(url);
    return client.db(db);
};