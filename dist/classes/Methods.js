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
const Helpers = new Helpers_1.Helpers();
class Methods {
    constructor(connect) {
        // обрабатывает и возвращает роль пользователя
        this.GetUserAccessLevel = (token) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (token) {
                        this.GetAuth(token)
                            .then((rs) => __awaiter(this, void 0, void 0, function* () {
                            this.Find(collections_1.collections.users, { token })
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
                    this.Find(collections_1.collections.users, { nickname })
                        .then((result) => __awaiter(this, void 0, void 0, function* () {
                        if (result.length > 0) {
                            rej(Helpers.CreateError("User already exist", 400));
                        }
                        else {
                            const pwd = Helpers.CreatePassword(password);
                            const token = Helpers.CreateToken(nickname);
                            // console.log(token);
                            this.Insert(collections_1.collections.users, {
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
                    (yield this.connect)
                        .collection(collections_1.collections.auth)
                        .find({ token })
                        .toArray((err, result) => __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        }
                        ;
                        if (result && result.length > 0) {
                            this.Find(collections_1.collections.users, { nickname: result[0].nickname })
                                .then((result) => __awaiter(this, void 0, void 0, function* () {
                                if (result[0].blocked) {
                                    rej(Helpers.CreateError("User is blocked", 400));
                                    (yield this.connect).collection(collections_1.collections.auth)
                                        .deleteOne({ nickname: result[0].nickname });
                                }
                                ;
                            })).catch((err) => {
                                rej(Helpers.CreateError(err, 404));
                            });
                        }
                        if (result.length > 0) {
                            res([]);
                        }
                        ;
                        rej(Helpers.CreateError("User is not auth", 401));
                    }));
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
                    (yield this.connect).collection(collections_1.collections.users).find({ nickname }).toArray((er, rl) => __awaiter(this, void 0, void 0, function* () {
                        if (er) {
                            rej(er);
                        }
                        ;
                        if (rl.length === 0) {
                            rej(er);
                        }
                        ;
                        if (rl[0].blocked) {
                            rej(Helpers.CreateError("User is blocked", 400));
                            (yield this.connect).collection(collections_1.collections.auth)
                                .deleteOne({ nickname });
                        }
                        ;
                        console.log(password, rl);
                        try {
                            if (Helpers.IsValidPassword(password, rl[0].password)) {
                                const token = Helpers.CreateToken(rl[0].nickname);
                                (yield this.connect).collection(collections_1.collections.auth)
                                    .find({ nickname })
                                    .toArray((err, result) => __awaiter(this, void 0, void 0, function* () {
                                    if (err) {
                                        rej(Helpers.CreateError(err, 500));
                                    }
                                    ;
                                    console.log("FindAuths", result);
                                    if (result.length === 0) {
                                        (yield this.connect)
                                            .collection(collections_1.collections.auth).insertOne({ nickname, token });
                                    }
                                    else {
                                        (yield this.connect)
                                            .collection(collections_1.collections.auth)
                                            .replaceOne({ nickname: rl[0].nickname }, { nickname: rl[0].nickname, token });
                                    }
                                    ;
                                    (yield this.connect).collection(collections_1.collections.users)
                                        .replaceOne({ nickname: rl[0].nickname }, Object.assign(Object.assign({}, rl[0]), { token }));
                                }));
                                res(token);
                            }
                            ;
                        }
                        catch (e) {
                            console.log(e, rl[0].password);
                        }
                        ;
                        rej(Helpers.CreateError("Password is not valid", 400));
                    }));
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
                    (yield this.connect)
                        .collection(collections_1.collections.users)
                        .find({ token })
                        .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        }
                        ;
                        if (result.length > 0) {
                            console.log("GetUserByToken", result);
                            const { nickname, blocked, confirmed, creationDate, role, _id } = result[0];
                            res({ nickname, blocked, confirmed, creationDate, role, id: _id });
                        }
                        ;
                        rej(Helpers.CreateError("User is not defined", 400));
                    });
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        // добавляет в бд новый элемент (сделать рефакторинг методов класса в будущем)
        this.Insert = (collection, data) => __awaiter(this, void 0, void 0, function* () {
            try {
                (yield this.connect)
                    .collection(collection)
                    .insertOne(data);
            }
            catch (e) {
                console.log(e);
            }
            ;
        });
        this.Find = (collection, find) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    (yield this.connect)
                        .collection(collection)
                        .find(find)
                        .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        }
                        ;
                        res(result);
                    });
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        this.Replace = (collection, find, newData) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                try {
                    this.Find(collection, find)
                        .then((rs) => __awaiter(this, void 0, void 0, function* () {
                        if (rs.length > 0) {
                            (yield this.connect).collection(collection).replaceOne(find, Object.assign(Object.assign({}, rs[0]), newData));
                            res(rs[0]);
                        }
                        else {
                            rej(Helpers.CreateError("Is not defined // Replace ", 400));
                        }
                        ;
                    }))
                        .catch((e) => rej(Helpers.CreateError(e, 500)));
                }
                catch (e) {
                    console.log(e);
                }
                ;
            }));
        };
        this.Delete = (collection, deleteData) => __awaiter(this, void 0, void 0, function* () {
            (yield this.connect)
                .collection(collection)
                .deleteOne(deleteData);
        });
        this.connect = connect();
    }
}
exports.Methods = Methods;
;
//# sourceMappingURL=Methods.js.map