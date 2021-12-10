import { PORT } from "./consts/port";
import { Methods as Funcs } from "./classes/Methods";
import { connect } from "./db";

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
    Methods.GetUser(Token)
        .then((rs: string) => {
            Methods.GetAuth(rs)
                .then((rsr) => {
                    res.json(rsr);
                })
                .catch((e) => {
                    res.json(e);
                });
        }) 
        .catch((err) => {
            console.log(err);
            res.json(err);
        });
}); 

app.post("/CreateUser", (req, res) => {
    Methods.CreateUser(req.body)
         .then((user) => {
            res.json(user);
        })
        .catch((error) => {
            console.log(error);
            res.json(error);
        });
});

app.post("/AuthUser", (req, res) => {
    Methods.AuthUser(req.body)
        .then((token) => {
            res.json({ token });
        })
        .catch((e) => {
            res.json(e);
        });
});

app.listen(PORT, () => console.log(`Server started http://localhost:${PORT}`));