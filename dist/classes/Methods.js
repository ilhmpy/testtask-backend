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
const collections_1 = require("../consts/collections");
const db_1 = require("../db");
const DatabaseMethods_1 = require("./DatabaseMethods");
const Helpers = new Helpers_1.Helpers();
const DB = new DatabaseMethods_1.DatabaseMethods(db_1.connect);
class Methods {
    constructor(connect) {
        // обрабатывает и возвращает роль пользователя
        this.GetUserAccessLevel = (token) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (token) {
                        this.GetAuth(token)
                            .then((rs) => __awaiter(this, void 0, void 0, function* () {
                            DB.Find(collections_1.collections.users, { token })
                                .then((rs) => {
                                res(rs[0].role);
                            })
                                .catch((e) => {
                                rej(e);
                            });
                        }))
                            .catch(e => {
                            rej(e);
                        });
                    }
                    else {
                        rej(Helpers.CreateError("Token is undefined", 400));
                    }
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        // создает пользователя
        this.CreateUser = ({ password, nickname, creationDate }) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    DB.Find(collections_1.collections.users, { nickname })
                        .then((result) => __awaiter(this, void 0, void 0, function* () {
                        if (result.length > 0) {
                            rej(Helpers.CreateError("User already exist", 400));
                        }
                        else {
                            const pwd = Helpers.CreatePassword(password);
                            const token = Helpers.CreateToken(nickname);
                            // console.log(token);
                            DB.Insert(collections_1.collections.users, {
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
                    })).catch((e) => {
                        rej(Helpers.CreateError(e, 400));
                    });
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
            }));
        };
        // проверяет авторизацию и возвращает пользователя если тот авторизован и не заблокирован
        this.GetAuth = (token) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    DB.FindOne(collections_1.collections.auth, { token })
                        .then((result) => __awaiter(this, void 0, void 0, function* () {
                        if (result != null) {
                            DB.FindOne(collections_1.collections.users, { nickname: result.nickname })
                                .then((result) => __awaiter(this, void 0, void 0, function* () {
                                if (result.blocked) {
                                    DB.Delete(collections_1.collections.auth, { nickname: result.nickname });
                                    rej(Helpers.CreateError("User is blocked", 400));
                                }
                                ;
                            })).catch((err) => {
                                rej(Helpers.CreateError(err, 404));
                            });
                        }
                        ;
                        if (result != null) {
                            res([]);
                        }
                        ;
                        rej(Helpers.CreateError("User is not auth", 401));
                    })).catch((err) => {
                        rej(err);
                    });
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        // авторизует пользователя, проверяет его наличие и добавляет новый токен обновляя сущность в коллекции пользователей
        this.AuthUser = ({ password, nickname }) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    DB.FindOne(collections_1.collections.users, { nickname })
                        .then((rl) => {
                        if (rl == null) {
                            rej(Helpers.CreateError("User is not defined", 400));
                        }
                        ;
                        console.log("RlBlocked", rl, rl.blocked);
                        console.log(password, rl);
                        try {
                            if (rl.blocked) {
                                DB.Delete(collections_1.collections.auth, { nickname })
                                    .then((rs) => {
                                    console.log(rs);
                                }).catch((err) => {
                                    console.log(err);
                                });
                                rej(Helpers.CreateError("User is blocked", 400));
                            }
                            else if ((Helpers.IsValidPassword(password, rl.password)) && !rl.blocked) {
                                const token = Helpers.CreateToken(rl.nickname);
                                DB.FindOne(collections_1.collections.auth, { nickname })
                                    .then((result) => {
                                    console.log("FindAuths", result);
                                    if (result === null) {
                                        DB.Insert(collections_1.collections.auth, { nickname, token });
                                    }
                                    else {
                                        DB.Replace(collections_1.collections.auth, { nickname: rl.nickname }, { nickname: rl.nickname, token })
                                            .then(() => undefined)
                                            .catch((err) => rej(err));
                                    }
                                    ;
                                    DB.Replace(collections_1.collections.users, { nickname: rl.nickname }, Object.assign(Object.assign({}, rl), { token }))
                                        .then(() => undefined)
                                        .catch((err) => rej(err));
                                }).catch((err) => {
                                    rej(err);
                                });
                                res(token);
                            }
                            ;
                        }
                        catch (e) {
                            console.log(e, rl[0].password);
                        }
                        ;
                        rej(Helpers.CreateError("Password is not valid", 400));
                    }).catch((err) => {
                        rej(err);
                    });
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        // возвращает пользователя по token'у перед этим действием нужно проверить уровень доступа отправлявшего с помощью GetUserLevelSuccess
        this.GetUserByToken = (token) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    DB.FindOne(collections_1.collections.users, { token })
                        .then((result) => {
                        if (result) {
                            console.log("GetUserByToken", result);
                            const { nickname, blocked, confirmed, creationDate, role, _id } = result;
                            res({ nickname, blocked, confirmed, creationDate, role, id: _id });
                        }
                        ;
                        rej(Helpers.CreateError("User is not defined", 400));
                    }).catch(err => res(err));
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        this.connect = connect();
    }
    ;
}
exports.Methods = Methods;
;
//# sourceMappingURL=Methods.js.map