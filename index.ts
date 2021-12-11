import { PORT } from "./consts/port";
import { Methods as Funcs } from "./classes/Methods";
import { connect } from "./db";
import { Helpers as Help } from "./classes/Helpers";
import { ObjectId } from "mongodb";
import { Application } from "express";

import { SignView, NewsView, SignUpView, NewsState, CommentsView, DeleteNewsView, CommentsState} from "./interfaces/index";
import { NewsViewModel, UsersRoles } from "./types";
import { collections } from "./consts/collections";
import { DatabaseMethods } from "./classes/DatabaseMethods";
import { ViewUsersModel } from "./types/user";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app: Application = express();
const toobusy = require("toobusy-js");

const parser = bodyParser.urlencoded({ extended: true, limit: "1kb"  });

const Helpers = new Help();
const DB = new DatabaseMethods(connect);

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
        if (Token != null) {
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
        } else {
            res.json(Helpers.CreateError("Token is undefined", 400));
        };
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
        console.log("InsertNews", token, post);
        Methods.GetUserAccessLevel(token)
            .then((rs) => {
                if (rs >= UsersRoles.Editor) {
                    DB.Insert(collections.news, { ...post, comments: [], confirmed: false });
                    res.json(Helpers.CreateError("News added", 200));
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
        DB.Find(collections.news, id ? { _id: new ObjectId(id.toString()) } : {})
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
        console.log("ChangeNewsState", body);
        Methods.GetUserAccessLevel(token)
            .then((level: UsersRoles) => {
                const _id = new ObjectId(id.toString())
                if (level === UsersRoles.Admin) {
                    DB.Replace(collections.news, { _id }, { confirmed });
                    res.json(Helpers.CreateError("News edited", 200));
                };
            })
            .catch((e) => {
                res.json(e);
            });
    } catch(e) {
        console.log(e);
    };
});

app.post("/InsertComment", (req, res) => {
    try {
        const body: CommentsView = req.body;
        const { newsId, nickname, email, creatorId, text, creationDate } = body;
        const _id = new ObjectId(newsId);
        console.log("InsertComment", body);
        if (body) {
            DB.Find(collections.news, { _id })
                .then((result: NewsViewModel[]) => {
                    const comments =  [...result[0].comments, {
                        nickname, email, creatorId, text, creationDate,
                        confirmed: false,
                    }];
                    console.log("NewComments", result, comments);
                    DB.Replace(collections.news, { _id }, { comments })
                        .then(() => {
                            res.json(Helpers.CreateError(`Comment add to ${_id} news`, 200));
                        }).catch((er) => {
                            res.json(er);
                        });
                }).catch((e) => {
                    console.log("ErrorInsertNewComment", e);
                    res.json(e);
                });
        };
    } catch(e) {
        console.log(e);
    };
});

app.post("/DeleteNews", (req, res) => {
    try {
        const body: DeleteNewsView = req.body;
        const { token, id } = body;
        Methods.GetUserAccessLevel(token)
            .then((level: UsersRoles) => {
                const _id = new ObjectId(id);
                if (level >= UsersRoles.Editor) {
                    DB.Delete(collections.news, { _id })
                        .then(() => {
                            res.json(Helpers.CreateError("News deleted", 200));
                        }).catch((err) => {
                            res.json(err);
                        });
                } else {
                    res.json(Helpers.CreateError("User haven't success", 400));
                };
            }).catch((er) => {
                res.json(er);
            });
    } catch(e) {
        res.json(Helpers.CreateError(e, 400));
    }
});

app.post("/ChangeCommentState", (req, res) => {
    const body: CommentsState = req.body;
    const { token, id, idx, confirmed } = body;
    if (body) {
        try {
            Methods.GetUserAccessLevel(token)
                .then((level) => {
                    if (level >= UsersRoles.Editor) {
                        const _id = new ObjectId(id);
                        DB.Find(collections.news, { _id })
                            .then((rs: NewsViewModel[]) => {
                                if (rs.length > 0) {
                                    console.log("ChangeCommentState", rs);
                                    const newData = { ...rs[0], comments: [...rs[0].comments ]};
                                    const edit = newData.comments[idx];
                                    if (edit) {
                                        edit.confirmed = confirmed;
                                        DB.Replace(collections.news, { _id }, newData);
                                        res.json(newData);
                                    } else {
                                        res.json(Helpers.CreateError("Comment is not defined", 400));
                                    };
                                } else {
                                    res.json(Helpers.CreateError("News is not defined", 400));
                                };
                            }).catch((err) => res.json(err));
                    } else {
                        res.json(Helpers.CreateError("User haven't success", 400));
                    };
                }).catch((err) => {
                    res.json(err);
                });
        } catch(e) {
            console.log(e);
            res.json(Helpers.CreateError(e, 500));
        };
    };
});

app.get("/GetEditors", (req, res) => {
    try {
        const { token } = req.query;
        Methods.GetUserAccessLevel(token.toString())
            .then((level) => {
                if (level === UsersRoles.Admin) {
                    DB.Find(collections.users, {})
                        .then((result: ViewUsersModel[]) => {
                            res.json(
                                result.map(
                                    ({ nickname, creationDate, confirmed, blocked, role, _id }) => {
                                        return ({ nickname, creationDate, confirmed, blocked, role, _id })
                                    }).filter((i: ViewUsersModel) => i.token !== token));
                        }).catch((err) => res.json(Helpers.CreateError(err, 500)));
                } else {
                    res.json(Helpers.CreateError("User haven't success", 400));
                };
            }).catch((err) => res.json(err));
    } catch(e) {
        res.json(Helpers.CreateError(e, 400));
    }
});

app.post("/ChangeEditorBlocked", (req, res) => {
    const { bool, token, id } = req.body;
    console.log("ChangeEditor/Blocked", req.body);
    Methods.GetUserAccessLevel(token.toString())
        .then((level) => {
            if (level === UsersRoles.Admin) {
                const _id = new ObjectId(id);
                DB.Replace(collections.users, { _id }, { blocked: bool })
                    .then(() => res.json(Helpers.CreateError("User edited", 200)))
                    .catch((err) => res.json(err));
            } else {
                res.json(Helpers.CreateError("User haven't success", 400));
            };
        }).catch((err) => {
            res.json(err);
        });
}); 

app.post("/ChangeEditorConfirmed", (req, res) => {
    const { bool, token, id } = req.body;
    console.log("ChangeEditor/Confirmed", req.body);
    Methods.GetUserAccessLevel(token.toString())
        .then((level) => {
            if (level === UsersRoles.Admin) {
                const _id = new ObjectId(id);
                DB.Replace(collections.users, { _id }, { confirmed: bool })
                    .then(() => res.json(Helpers.CreateError("User edited", 200)))
                    .catch((err) => res.json(err));
            } else {
                res.json(Helpers.CreateError("User haven't success", 400));
            };
        }).catch((err) => {
            res.json(err);
        });
}); 

app.listen(PORT, () => console.log(`Server started http://localhost:${PORT}`));