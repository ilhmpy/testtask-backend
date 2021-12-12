"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const port_1 = require("./consts/port");
const Methods_1 = require("./classes/Methods");
const db_1 = require("./db");
const Helpers_1 = require("./classes/Helpers");
const mongodb_1 = require("mongodb");
const types_1 = require("./types");
const collections_1 = require("./consts/collections");
const DatabaseMethods_1 = require("./classes/DatabaseMethods");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const toobusy = require("toobusy-js");
const parser = bodyParser.urlencoded({ extended: true, limit: "1kb" });
const Helpers = new Helpers_1.Helpers();
const DB = new DatabaseMethods_1.DatabaseMethods(db_1.connect);
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
        if (Token != null) {
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
        else {
            res.json(Helpers.CreateError("Token is undefined", 400));
        }
        ;
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
            console.log("ERRORRRR", e);
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
        console.log("InsertNews", token, post);
        Methods.GetUserAccessLevel(token)
            .then((rs) => {
            if (rs >= types_1.UsersRoles.Editor) {
                DB.Insert(collections_1.collections.news, Object.assign(Object.assign({}, post), { comments: [], confirmed: false }));
                res.json(Helpers.CreateError("News added", 200));
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
        DB.Find(collections_1.collections.news, id ? { _id: new mongodb_1.ObjectId(id.toString()) } : {})
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
app.post("/ChangeNewsState", (req, res) => {
    try {
        const body = req.body;
        const { token, confirmed, id } = body;
        console.log("ChangeNewsState", body);
        Methods.GetUserAccessLevel(token)
            .then((level) => {
            const _id = new mongodb_1.ObjectId(id.toString());
            if (level === types_1.UsersRoles.Admin) {
                DB.Replace(collections_1.collections.news, { _id }, { confirmed });
                res.json(Helpers.CreateError("News edited", 200));
            }
            ;
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
app.post("/InsertComment", (req, res) => {
    try {
        const body = req.body;
        const { newsId, nickname, email, creatorId, text, creationDate } = body;
        const _id = new mongodb_1.ObjectId(newsId);
        console.log("InsertComment", body);
        if (body) {
            DB.Find(collections_1.collections.news, { _id })
                .then((result) => {
                const comments = [...result[0].comments, {
                        nickname, email, creatorId, text, creationDate,
                        confirmed: false,
                    }];
                console.log("NewComments", result, comments);
                DB.Replace(collections_1.collections.news, { _id }, { comments })
                    .then(() => {
                    res.json(Helpers.CreateError(`Comment add to ${_id} news`, 200));
                }).catch((er) => {
                    res.json(er);
                });
            }).catch((e) => {
                console.log("ErrorInsertNewComment", e);
                res.json(e);
            });
        }
        ;
    }
    catch (e) {
        console.log(e);
    }
    ;
});
app.post("/DeleteNews", (req, res) => {
    try {
        const body = req.body;
        const { token, id } = body;
        Methods.GetUserAccessLevel(token)
            .then((level) => {
            const _id = new mongodb_1.ObjectId(id);
            if (level >= types_1.UsersRoles.Editor) {
                DB.Delete(collections_1.collections.news, { _id })
                    .then(() => {
                    res.json(Helpers.CreateError("News deleted", 200));
                }).catch((err) => {
                    res.json(err);
                });
            }
            else {
                res.json(Helpers.CreateError("User haven't success", 400));
            }
            ;
        }).catch((er) => {
            res.json(er);
        });
    }
    catch (e) {
        res.json(Helpers.CreateError(e, 400));
    }
});
app.post("/ChangeCommentState", (req, res) => {
    const body = req.body;
    const { token, id, idx, confirmed } = body;
    if (body) {
        try {
            Methods.GetUserAccessLevel(token)
                .then((level) => {
                if (level >= types_1.UsersRoles.Editor) {
                    const _id = new mongodb_1.ObjectId(id);
                    DB.Find(collections_1.collections.news, { _id })
                        .then((rs) => {
                        if (rs.length > 0) {
                            console.log("ChangeCommentState", rs);
                            const newData = Object.assign(Object.assign({}, rs[0]), { comments: [...rs[0].comments] });
                            const edit = newData.comments[idx];
                            if (edit) {
                                edit.confirmed = confirmed;
                                DB.Replace(collections_1.collections.news, { _id }, newData);
                                res.json(newData);
                            }
                            else {
                                res.json(Helpers.CreateError("Comment is not defined", 400));
                            }
                            ;
                        }
                        else {
                            res.json(Helpers.CreateError("News is not defined", 400));
                        }
                        ;
                    }).catch((err) => res.json(err));
                }
                else {
                    res.json(Helpers.CreateError("User haven't success", 400));
                }
                ;
            }).catch((err) => {
                res.json(err);
            });
        }
        catch (e) {
            console.log(e);
            res.json(Helpers.CreateError(e, 500));
        }
        ;
    }
    ;
});
app.get("/GetEditors", (req, res) => {
    try {
        const { token } = req.query;
        Methods.GetUserAccessLevel(token.toString())
            .then((level) => {
            if (level === types_1.UsersRoles.Admin) {
                DB.Find(collections_1.collections.users, {})
                    .then((result) => {
                    res.json(result.map(({ nickname, creationDate, confirmed, blocked, role, _id }) => {
                        return ({ nickname, creationDate, confirmed, blocked, role, _id });
                    }));
                }).catch((err) => res.json(Helpers.CreateError(err, 500)));
            }
            else {
                res.json(Helpers.CreateError("User haven't success", 400));
            }
            ;
        }).catch((err) => res.json(err));
    }
    catch (e) {
        res.json(Helpers.CreateError(e, 400));
    }
});
app.post("/ChangeEditorBlocked", (req, res) => {
    const { bool, token, id } = req.body;
    console.log("ChangeEditor/Blocked", req.body);
    Methods.GetUserAccessLevel(token.toString())
        .then((level) => {
        if (level === types_1.UsersRoles.Admin) {
            const _id = new mongodb_1.ObjectId(id);
            DB.Replace(collections_1.collections.users, { _id }, { blocked: bool })
                .then(() => res.json(Helpers.CreateError("User edited", 200)))
                .catch((err) => res.json(err));
        }
        else {
            res.json(Helpers.CreateError("User haven't success", 400));
        }
        ;
    }).catch((err) => {
        res.json(err);
    });
});
app.post("/ChangeEditorConfirmed", (req, res) => {
    const { bool, token, id } = req.body;
    console.log(`${Math.random() * 100}ChangeEditor/Confirmed`, req.body);
    Methods.GetUserAccessLevel(token.toString())
        .then((level) => {
        if (level === types_1.UsersRoles.Admin) {
            const _id = new mongodb_1.ObjectId(id);
            DB.Replace(collections_1.collections.users, { _id }, bool ? { role: types_1.UsersRoles.Editor, confirmed: bool } : { role: types_1.UsersRoles.User, confirmed: bool })
                .then(() => res.json(Helpers.CreateError("User edited", 200)))
                .catch((err) => res.json(err));
        }
        else {
            res.json(Helpers.CreateError("User haven't success", 400));
        }
        ;
    }).catch((err) => {
        res.json(err);
    });
});
app.listen(port_1.PORT, () => console.log(`Server started http://localhost:${port_1.PORT}`));
//# sourceMappingURL=index.js.map