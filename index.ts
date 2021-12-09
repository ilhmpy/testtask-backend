import { PORT } from "./consts/port";
import { connect } from "./db";
import { Methods as Funcs } from "./classes/Methods";
import { User } from "./types/user"; 

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const parser = bodyParser.urlencoded({ extended: true });

app.use(cors());
app.use(parser);
app.use(bodyParser.json());

const Methods = new Funcs(connect);

app.get('/', (req, res) => {
    res.json({
      message: 'Server work'
    });      
});

app.get("/GetUser", (req, res) => {
    const { Token } = req.query;
    res.json({ err: "rrr" })
    Methods.GetUser(Token)
        .then((rs) => {
            console.log(rs);
            res.json({ rs });
        })
        .catch((err) => {
            console.log(err);
            res.status.ok = false;
            res.json(err);
        });
});

app.post("/CreateUser", (req, res) => {
    const { email, password } = req.body;
    Methods.CreateUser(email, password)
         .then((user) => {
            res.json(user);
        })
        .catch((error) => {
            console.log(error);
            res.json(error);
        });
});

app.listen(PORT, () => console.log(`Server started http://localhost:${PORT}`));