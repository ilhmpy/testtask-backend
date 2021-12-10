import { Helpers as Help } from "./Helpers";
import { UsersRoles, ViewUsersModel } from "../types/user";

const Helpers = new Help();

export class Methods {
    connect: any;
    constructor(connect: any) {
        this.connect = connect();
    }

    public GetUserSuccessLevel = (token: string) => {
        return new Promise(async (res, rej) => {
            try {
                this.GetAuth(token)
                    .then(async (rs) => {
                        this.Find("users", { token })
                            .then((rs) => {
                                res(rs[0].role);
                            })
                            .catch((e) => {
                                rej(e);
                            });
                    })
                    .catch(e => {
                        rej(e);
                    });
            } catch (e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };

    
    public CreateUser = ({ password, nickname, creationDate }: ViewUsersModel) => {
        return new Promise(async (res, rej) => {
            try {
                (await this.connect)
                    .collection("users")
                    .find({ nickname })
                    .toArray(async (err, result) => {
                        if (err) {
                            rej(err);
                        };
                        if (result.length > 0) {
                            rej(Helpers.CreateError("User already exist", 400));
                        } else {
                            const pwd = Helpers.CreatePassword(password);
                            const token = Helpers.CreateToken(nickname);
                            console.log(token);
                            (await this.connect).collection("users").insertOne({
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
                    });
            } catch (e) {
                rej(Helpers.CreateError(e, 500));
            }
        });
    };

    public GetAuth = (token: string) => {
        return new Promise(async (res, rej) => {
            try {
                (await this.connect)
                    .collection("auth")
                    .find({ token })
                    .toArray(async (err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        };
                        // console.log(result);
                        /* if (result[0].blocked) {
                            rej(Helpers.CreateError("User is blocked", 400));
                            (await this.connect).collection("auth")
                                .deleteOne({ nickname: result[0].nickname });
                        }; */
                        if (result.length > 0) {
                            res([]);
                        };
                        rej(Helpers.CreateError("User is not auth", 401));
                    });
            } catch(e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };

    public AuthUser = ({ password, nickname }) => {
        return new Promise(async (res, rej) => {
            try {
                    (await this.connect).collection("users").find({ nickname }).toArray(async (er, rl) => {
                        if (er) {
                            rej(er);
                        };
                        if (rl.length === 0) {
                            rej(er);
                        };
                        /*
                        if (rl[0].blocked) {
                            rej(Helpers.CreateError("User is blocked", 400));
                            (await this.connect).collection("auth")
                                .deleteOne({ nickname });
                        }; */
                        if (Helpers.IsValidPassword(password, rl[0].password)) {
                            const token = Helpers.CreateToken(rl[0].nickname);
                            (await this.connect).collection("auth")
                                .find({ nickname })
                                .toArray(async (err, result) => {
                                    if (err) {
                                        rej(Helpers.CreateError(err, 500));
                                    };
                                    console.log("FindAuths", result);
                                    if (result.length === 0) {
                                        (await this.connect)
                                            .collection("auth").insertOne({ nickname, token });
                                    } else {
                                        (await this.connect)
                                            .collection("auth")
                                                .replaceOne({ nickname: rl[0].nickname }, { nickname: rl[0].nickname, token });
                                    };
                                    (await this.connect).collection("users")
                                        .replaceOne({ nickname: rl[0].nickname }, { ...rl[0], token });
                                });
                                res(token);
                        };
                        rej(Helpers.CreateError("Password is not valid", 400));
                    });
            } catch(e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };

    public GetUserByToken = (token: string) => {
        return new Promise(async (res, rej) => {
            try {
                (await this.connect)
                .collection("users")
                .find({ token })
                .toArray((err, result) => { 
                    if (err) {
                        rej(Helpers.CreateError(err, 500));
                    };
                    if (result.length > 0) {
                        console.log("GetUserByToken", result);
                        const { nickname, blocked, confirmed, creationDate, role, _id } = result[0];
                        res({ nickname, blocked, confirmed, creationDate, role, id: _id });
                    };
                    rej(Helpers.CreateError("User is not defined", 400));
                });
            } catch(e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };

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
                            rej(err);
                        };
                        res(result);
                    });
            } catch(e) {
                console.log(e);
            };
        });
    };
};