import { PORT } from "./consts/port";
import { Methods as Funcs } from "./classes/Methods";
import { connect } from "./db";
import { Helpers as Help } from "./classes/Helpers";
import { ObjectId } from "mongodb";
import { Application } from "express";

import { SignView, NewsView, SignUpView, NewsState } from "./interfaces/index";
import { UsersRoles } from "./types";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app: Application = express();
const toobusy = require("toobusy-js");

const parser = bodyParser.urlencoded({ extended: true, limit: "1kb"  });

const Helpers = new Help();

app.use(cors());
app.use(parser);
app.use(bodyParser.json());
app.use(express.json({ limit: "1kb" }));
app.use((req, res, next) => {
    if (toobusy()) {
        res.json({ server: "Server Too Busy", status: 503 });
    } else {
        next();
    };
});

process.on("uncaughtException", () => {
    process.exit();
});

const Methods = new Funcs(connect);

app.get('/', (req, res) => {
    res.json({
      message: 'Server work'
    });      
});

app.get("/GetAuth", (req, res) => {
    try {
        const { Token } = req.query;
        Methods.GetAuth(Token.toString())
        .then((rs: string) => {
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
    } catch(e) {
        console.log(e);
    }
}); 

app.post("/CreateUser", (req, res) => {
        const body: SignUpView = req.body;
        try {
            Methods.CreateUser(body)
                .then((user) => {
                    res.json(user);
                })
                .catch((error) => {
                    console.log(error);
                    res.json(error);
                });
        } catch(e) {
            console.log(e);
        };
});

app.post("/AuthUser", (req, res) => {
       try {
        const body: SignView = req.body;
        console.log(body);
        Methods.AuthUser(body)
            .then((token: string) => {
                console.log(token);
                res.json({ token });
            }) 
            .catch((e) => {
                res.json(e);
            });
       } catch(e) {
            console.log(e);
       };
});

app.post("/InsertNews", (req, res) => {
    try {
        const body: NewsView = req.body;
        const { token, post } = body;
        console.log(token, post);
        Methods.GetUserSuccessLevel(token)
        .then((rs) => {
            if (rs >= UsersRoles.Editor) {
                Methods.Insert("posts", { ...post, comments: [], confirmed: false });
                res.json({
                  post: "Post added"  
                });
            } else {
                res.json(Helpers.CreateError("User have'nt access", 400));
            };
        })
        .catch((e) => res.json(e)); 
    } catch(e) {
        console.log(e);
    };
});

app.get("/GetNews", (req, res) => {
    try {
        const { id } = req.query;
        Methods.Find("posts", id ? { _id: new ObjectId(id.toString()) } : {})
            .then((rs) => {
                console.log("GetPosts", rs);
                res.json(rs);
            }).catch((err) => console.log(err));
    } catch(e) {
        console.log(e); 
    };
});

app.post("/ChangeNewsState", (req, res) => {
    try {
        const body: NewsState = req.body;
        const { token, confirmed, id } = body;
        Methods.GetUserSuccessLevel(token)
            .then((level: UsersRoles) => {
                if (level === UsersRoles.Admin) {
                    Methods.Replace("posts", { _id: new ObjectId(id.toString()) }, { confirmed });
                };
            })
            .catch((e) => {
                res.json(e);
            });
    } catch(e) {
        console.log(e);
    };
});

app.listen(PORT, () => console.log(`Server started http://localhost:${PORT}`));