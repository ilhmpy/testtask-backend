import { PORT } from "./consts/port";
import { Methods as Funcs } from "./classes/Methods";
import { connect } from "./db";
import { UsersRoles } from "./types/user";
import { Helpers as Help } from "./classes/Helpers";
import { ObjectId } from "mongodb";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const toobusy = require("toobusy-js");

const parser = bodyParser.urlencoded({ extended: true, limit: "1kb"  });

const Helpers = new Help();

app.use(cors());
app.use(parser);
app.use(bodyParser.json());
app.use(express.json({ limit: "1kb" }));
app.use((req, res, next) => {
    if (toobusy()) {
        res.send(503, "Server Too Busy");
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
    const { Token } = req.query;
        Methods.GetAuth(Token)
        .then((rs: string) => {
            Methods.GetUserByToken(Token)
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
            console.log(token);
            res.json({ token });
        })
        .catch((e) => {
            res.json(e);
        });
});

app.post("/InsertPost", (req, res) => {
    const { token, post } = req.body;
    console.log(token, post);
    Methods.GetUserSuccessLevel(token)
        .then((rs) => {
            if (rs >= UsersRoles.Editor) {
                Methods.Insert("posts", { ...post, comments: [], confirmed: true });
                res.json({
                  post: "Post added"  
                });
            } else {
                res.json(Helpers.CreateError("User have'nt access", 400));
            };
        })
        .catch((e) => res.json(e)); 
});

app.get("/GetPosts", (req, res) => {
    try {
        const { id } = req.query;
        console.log(id);
        Methods.Find("posts", id ? { _id: new ObjectId(id) } : {})
            .then((rs) => {
                console.log("GetPosts", rs);
                res.json(rs);
            }).catch((err) => console.log(err));
    } catch(e) {
        console.log(e); 
    };
});

app.listen(PORT, () => console.log(`Server started http://localhost:${PORT}`));