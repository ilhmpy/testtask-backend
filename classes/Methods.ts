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
    };

    // обрабатывает и возвращает роль пользователя

    public GetUserAccessLevel = (token: string) => {
        return new Promise(async (res, rej) => {
            try {
                if (token) {
                    this.GetAuth(token)
                        .then(async (rs) => {
                            DB.Find(collections.users, { token })
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

                DB.Find(collections.users, { nickname })
                    .then(async (result: ViewUsersModel[]) => {
                        if (result.length > 0) {
                            rej(Helpers.CreateError("User already exist", 400));
                        } else {
                            const pwd = Helpers.CreatePassword(password);
                            const token = Helpers.CreateToken(nickname);
                            // console.log(token);
                            DB.Insert(collections.users, {
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
                DB.FindOne(collections.auth, { token })
                    .then(async (result: Auth) => {
                        if (result != null) {
                            DB.FindOne(collections.users, { nickname: result.nickname })
                                .then(async (result: ViewUsersModel) => {
                                    if (result.blocked) {
                                        DB.Delete(collections.auth, { nickname: result.nickname });
                                        rej(Helpers.CreateError("User is blocked", 400));
                                    };
                                }).catch((err) => {
                                    rej(Helpers.CreateError(err, 404));
                                });
                        };
                        if (result != null) {
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
                    DB.FindOne(collections.users, { nickname })
                        .then((rl: ViewUsersModel) => {
                            if (rl == null) {
                                rej(Helpers.CreateError("User is not defined", 400));
                            };
                            console.log("RlBlocked", rl, rl.blocked);
                            console.log(password, rl);
                            try {
                                if (rl.blocked) {
                                    DB.Delete(collections.auth, { nickname })
                                        .then((rs) => {
                                            console.log(rs);
                                        }).catch((err) => {
                                            console.log(err);
                                        });
                                    rej(Helpers.CreateError("User is blocked", 400));
                                } else if ((Helpers.IsValidPassword(password, rl.password)) && !rl.blocked) {
                                    const token = Helpers.CreateToken(rl.nickname);
                                    DB.FindOne(collections.auth, { nickname })
                                        .then((result: Auth) => {
                                            console.log("FindAuths", result);
                                            if (result === null) {
                                                DB.Insert(collections.auth, { nickname, token });
                                            } else {
                                                DB.Replace(collections.auth, 
                                                    { nickname: rl.nickname }, { nickname: rl.nickname, token })
                                                .then(() => undefined)
                                                .catch((err) => rej(err));
                                            };
                                            DB.Replace(collections.users, { nickname: rl.nickname }, { ...rl, token })
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
                DB.FindOne(collections.users, { token })
                    .then((result: ViewUsersModel) => {
                        if (result) {
                            console.log("GetUserByToken", result);
                            const { nickname, blocked, confirmed, creationDate, role, _id } = result;
                            res({ nickname, blocked, confirmed, creationDate, role, id: _id });
                        };
                        rej(Helpers.CreateError("User is not defined", 400));
                    }).catch(err => res(err));
            } catch(e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };
};