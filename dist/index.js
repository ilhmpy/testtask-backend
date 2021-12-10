"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const port_1 = require("./consts/port");
const Methods_1 = require("./classes/Methods");
const db_1 = require("./db");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const toobusy = require("toobusy-js");
const parser = bodyParser.urlencoded({ extended: true, limit: "1kb" });
app.use(cors());
app.use(parser);
app.use(bodyParser.json());
app.use(express.json({ limit: "1kb" }));
app.use((req, res, next) => {
    if (toobusy()) {
        res.send(503, "Server Too Busy");
    }
    else {
        next();
    }
    ;
});
process.on("uncaughtException", () => {
    process.exit();
});
const Methods = new Methods_1.Methods(db_1.connect);
app.get('/', (req, res) => {
    res.json({
        message: 'Server work'
    });
});
app.get("/GetAuth", (req, res) => {
    const { Token } = req.query;
    Methods.GetAuth(Token)
        .then((rs) => {
        Methods.GetUserByToken(Token)
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
app.listen(port_1.PORT, () => console.log(`Server started http://localhost:${port_1.PORT}`));
//# sourceMappingURL=index.js.map