import { Helpers as Help } from "./Helpers";
import { UsersRoles, ViewUsersModel } from "../types/user";
import { NewsViewModel, Auth } from "../types";
import { SignUpView } from "../interfaces";
import { collections } from "../consts/collections";
import { connect } from "../db";
import { DatabaseMethods } from "./DatabaseMethods";

const Helpers = new Help();
const DB = new DatabaseMethods(connect);

export class Methods {
    connect: any;
    constructor(connect: any) {
        this.connect = connect();
    }

    // обрабатывает и возвращает роль пользователя

    public GetUserAccessLevel = (token: string) => {
        return new Promise(async (res, rej) => {
            try {
                if (token) {
                    this.GetAuth(token)
                        .then(async (rs) => {
                            this.Find(collections.users, { token })
                                .then((rs: ViewUsersModel[]) => {
                                    res(rs[0].role);
                                })
                                .catch((e) => {
                                    rej(e);
                                });
                        })
                        .catch(e => {
                            rej(e);
                        });
                } else {
                    rej(Helpers.CreateError("Token is undefined", 400));
                }
            } catch (e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };

    // создает пользователя

    public CreateUser = ({ password, nickname, creationDate }: SignUpView) => {
        return new Promise(async (res, rej) => {
            try {

                this.Find(collections.users, { nickname })
                    .then(async (result: ViewUsersModel[]) => {
                        if (result.length > 0) {
                            rej(Helpers.CreateError("User already exist", 400));
                        } else {
                            const pwd = Helpers.CreatePassword(password);
                            const token = Helpers.CreateToken(nickname);
                            // console.log(token);
                            this.Insert(collections.users, {
                                password: pwd,
                                token,
                                nickname,
                                creationDate,
                                confirmed: false,
                                blocked: false,
                                role: UsersRoles.User,
                            });
                            res(Helpers.CreateError("User created", 200));
                        };
                    }).catch((e) => {
                        rej(Helpers.CreateError(e, 400));
                    });
            } catch (e) {
                rej(Helpers.CreateError(e, 500));
            }
        });
    };

    // проверяет авторизацию и возвращает пользователя если тот авторизован и не заблокирован

    public GetAuth = (token: string) => {
        return new Promise(async (res, rej) => {
            try {
                this.Find(collections.auth, { token })
                    .then(async (result: Auth[]) => {
                        if (result && result.length > 0) {
                            this.Find(collections.users, { nickname: result[0].nickname })
                                .then(async (result: ViewUsersModel[]) => {
                                    if (result[0].blocked) {
                                        this.Delete(collections.auth, { nickname: result[0].nickname });
                                        rej(Helpers.CreateError("User is blocked", 400));
                                    };
                                }).catch((err) => {
                                    rej(Helpers.CreateError(err, 404));
                                });
                        }
                        if (result.length > 0) {
                            res([]);
                        };
                        rej(Helpers.CreateError("User is not auth", 401));
                    }).catch((err) => {
                        rej(err);
                    });
            } catch(e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };

    // авторизует пользователя, проверяет его наличие и добавляет новый токен обновляя сущность в коллекции пользователей

    public AuthUser = ({ password, nickname }) => {
        return new Promise(async (res, rej) => {
            try {
                    this.Find(collections.users, { nickname })
                        .then((rl: ViewUsersModel[]) => {
                            if (rl.length === 0) {
                                rej(Helpers.CreateError("User is not defined", 400));
                            };
                            if (rl[0].blocked) {
                                this.Delete(collections.auth, { nickname });
                                rej(Helpers.CreateError("User is blocked", 400));
                            };
                            console.log(password, rl);
                            try {
                                if (Helpers.IsValidPassword(password, rl[0].password)) {
                                    const token = Helpers.CreateToken(rl[0].nickname);
                                    this.Find(collections.auth, { nickname })
                                        .then((result: Auth[]) => {
                                            console.log("FindAuths", result);
                                            if (result.length === 0) {
                                                this.Insert(collections.auth, { nickname, token });
                                            } else {
                                                this.Replace(collections.auth, 
                                                    { nickname: rl[0].nickname }, { nickname: rl[0].nickname, token })
                                                .then(() => undefined)
                                                .catch((err) => rej(err));
                                            };
                                            this.Replace(collections.users, { nickname: rl[0].nickname }, { ...rl[0], token })
                                                .then(() => undefined)
                                                .catch((err) => rej(err));
                                        }).catch((err) => {
                                            rej(err);
                                        });
                                        res(token);
                                }; 
                            } catch(e) {
                                console.log(e, rl[0].password);
                            };
                            rej(Helpers.CreateError("Password is not valid", 400));
                        }).catch((err) => {
                            rej(err);
                        });
            } catch(e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };

    // возвращает пользователя по token'у перед этим действием нужно проверить уровень доступа отправлявшего с помощью GetUserLevelSuccess

    public GetUserByToken = (token: string) => {
        return new Promise(async (res, rej) => {
            try {
                this.Find(collections.users, { token })
                    .then((result: ViewUsersModel[]) => {
                        if (result.length > 0) {
                            console.log("GetUserByToken", result);
                            const { nickname, blocked, confirmed, creationDate, role, _id } = result[0];
                            res({ nickname, blocked, confirmed, creationDate, role, id: _id });
                        };
                        rej(Helpers.CreateError("User is not defined", 400));
                    }).catch(err => res(err));
            } catch(e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };
        // добавляет в бд новый элемент (сделать рефакторинг методов класса в будущем)

        public Insert = async (collection: string, data) => {
            try {
                (await this.connect)
                    .collection(collection)
                    .insertOne(data);
            } catch(e) {
                console.log(e);
            };
        };
        
        public Find = (collection: string, find) => {
            return new Promise(async (res, rej) => {
                try {
                    (await this.connect)
                        .collection(collection)
                        .find(find)
                        .toArray((err, result) => {
                            if (err) {
                                rej(Helpers.CreateError(err, 500));
                            };
                            res(result);
                        });
                } catch(e) {
                    rej(Helpers.CreateError(e, 500));
                };
            });
        };
    
        public Replace = (collection: string, find, newData) => {
            return new Promise(async (res, rej) => {
                try {
                    this.Find(collection, find)
                        .then(async (rs: any[]) => {
                            if (rs.length > 0) {
                                (await this.connect).collection(collection).replaceOne(find, { ...rs[0], ...newData });
                                res(rs[0]);
                            } else {
                                rej(Helpers.CreateError("Is not defined // Replace ", 400));
                            };
                        })
                        .catch((e) => rej(Helpers.CreateError(e, 500)));
                } catch(e) {
                    console.log(e)
                };
            });
        };
    
        public Delete = async (collection: string, deleteData) => {
            (await this.connect)
                .collection(collection)
                .deleteOne(deleteData);
        };
};