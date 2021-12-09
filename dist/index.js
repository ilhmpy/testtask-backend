"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const port_1 = require("./consts/port");
const db_1 = require("./db");
const Methods_1 = require("./classes/Methods");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const parser = bodyParser.urlencoded({ extended: true });
app.use(cors());
app.use(parser);
app.use(bodyParser.json());
const Methods = new Methods_1.Methods(db_1.connect);
app.get('/', (req, res) => {
    res.json({
        message: 'Server work'
    });
});
app.get("/GetUser", (req, res) => {
    const { Token } = req.query;
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
app.listen(port_1.PORT, () => console.log(`Server started http://localhost:${port_1.PORT}`));
//# sourceMappingURL=index.js.map