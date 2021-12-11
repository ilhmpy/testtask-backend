"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const port_1 = require("./consts/port");
const Methods_1 = require("./classes/Methods");
const db_1 = require("./db");
const user_1 = require("./types/user");
const Helpers_1 = require("./classes/Helpers");
const mongodb_1 = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const toobusy = require("toobusy-js");
const parser = bodyParser.urlencoded({ extended: true, limit: "1kb" });
const Helpers = new Helpers_1.Helpers();
app.use(cors());
app.use(parser);
app.use(bodyParser.json());
app.use(express.json({ limit: "1kb" }));
app.use((req, res, next) => {
    if (toobusy()) {
        res.json({ server: "Server Too Busy", status: 503 });
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
    try {
        const { Token } = req.query;
        Methods.GetAuth(Token.toString())
            .then((rs) => {
            Methods.GetUserByToken(Token.toString())
                .then((rsr) => {
                res.json(rsr);
            })
                .catch((e) => {
                console.log(e);
                res.json(e);
            });
        })
            .catch((err) => {
            console.log(err);
            res.json(err);
        });
    }
    catch (e) {
        console.log(e);
    }
});
app.post("/CreateUser", (req, res) => {
    const body = req.body;
    try {
        Methods.CreateUser(body)
            .then((user) => {
            res.json(user);
        })
            .catch((error) => {
            console.log(error);
            res.json(error);
        });
    }
    catch (e) {
        console.log(e);
    }
    ;
});
app.post("/AuthUser", (req, res) => {
    try {
        const body = req.body;
        console.log(body);
        Methods.AuthUser(body)
            .then((token) => {
            console.log(token);
            res.json({ token });
        })
            .catch((e) => {
            res.json(e);
        });
    }
    catch (e) {
        console.log(e);
    }
    ;
});
app.post("/InsertNews", (req, res) => {
    try {
        const body = req.body;
        const { token, post } = body;
        console.log(token, post);
        Methods.GetUserSuccessLevel(token)
            .then((rs) => {
            if (rs >= user_1.UsersRoles.Editor) {
                Methods.Insert("posts", Object.assign(Object.assign({}, post), { comments: [], confirmed: false }));
                res.json({
                    post: "Post added"
                });
            }
            else {
                res.json(Helpers.CreateError("User have'nt access", 400));
            }
            ;
        })
            .catch((e) => res.json(e));
    }
    catch (e) {
        console.log(e);
    }
    ;
});
app.get("/GetNews", (req, res) => {
    try {
        const { id } = req.query;
        Methods.Find("posts", id ? { _id: new mongodb_1.ObjectId(id.toString()) } : {})
            .then((rs) => {
            console.log("GetPosts", rs);
            res.json(rs);
        }).catch((err) => console.log(err));
    }
    catch (e) {
        console.log(e);
    }
    ;
});
app.listen(port_1.PORT, () => console.log(`Server started http://localhost:${port_1.PORT}`));
//# sourceMappingURL=index.js.map