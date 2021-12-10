"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Methods = void 0;
const Helpers_1 = require("./Helpers");
const user_1 = require("../types/user");
const db_1 = require("../db");
const Helpers = new Helpers_1.Helpers(db_1.connect);
class Methods {
    constructor(connect) {
        this.GetUser = (token) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    (yield this.connect)
                        .collection("users")
                        .find({ token })
                        .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        }
                        ;
                        if (result.length == 0) {
                            rej(Helpers.CreateError("User is not defined", 404));
                        }
                        ;
                        res(result[0]);
                    });
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        this.CreateUser = ({ password, nickname, creationDate }) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    (yield this.connect)
                        .collection("users")
                        .find({ nickname })
                        .toArray((err, result) => __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            rej(err);
                        }
                        ;
                        if (result.length > 0) {
                            rej(Helpers.CreateError("User already exist", 400));
                        }
                        else {
                            const pwd = Helpers.CreatePassword(password);
                            const token = Helpers.CreateToken(nickname);
                            console.log(token);
                            (yield this.connect).collection("users").insertOne({
                                password: pwd,
                                token,
                                nickname,
                                creationDate,
                                confirmed: false,
                                blocked: false,
                                role: user_1.UsersRoles.User,
                            });
                            res(Helpers.CreateError("User created", 200));
                        }
                        ;
                    }));
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
            }));
        };
        this.GetAuth = (token) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    (yield this.connect)
                        .collection("auth")
                        .find({ token })
                        .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        }
                        ;
                        if (result.length > 0) {
                            res([]);
                        }
                        ;
                        rej(Helpers.CreateError("User is not auth", 401));
                    });
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        this.AuthUser = ({ password, nickname }) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.GetAuth(nickname)
                        .then((r) => {
                        rej(Helpers.CreateError("User is auth", 400));
                    })
                        .catch((e) => __awaiter(this, void 0, void 0, function* () {
                        (yield this.connect).collection("users").find({ nickname }).toArray((er, rl) => __awaiter(this, void 0, void 0, function* () {
                            console.log(rl, nickname);
                            if (er) {
                                rej(er);
                            }
                            ;
                            if (rl.length === 0) {
                                rej(er);
                            }
                            ;
                            if (Helpers.IsValidPassword(password, rl[0].password)) {
                                const token = Helpers.CreateToken(rl[0].nickname);
                                (yield this.connect).collection("users").replaceOne({ nickname: rl[0].nickname }, Object.assign(Object.assign({}, rl[0]), { token }));
                                (yield this.connect).collection("auth").insertOne({ nickname, token });
                                res(token);
                            }
                            ;
                            rej(Helpers.CreateError("Password is not valid", 400));
                        }));
                    }));
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        this.GetUserByToken = (token) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                (yield this.connect)
                    .collection("users")
                    .find({ token })
                    .toArray((err, result) => {
                    if (err) {
                        rej(Helpers.CreateError(err, 500));
                    }
                    ;
                    if (result.length > 0) {
                        // console.log("GetUserByToken", result);
                        const { nickname, blocked, confirmed, creationDate, role } = result[0];
                        res({ nickname, blocked, confirmed, creationDate, role });
                    }
                    ;
                    rej(Helpers.CreateError("User is not defined", 400));
                });
            }));
        };
        this.connect = connect();
    }
}
exports.Methods = Methods;
;
//# sourceMappingURL=Methods.js.map