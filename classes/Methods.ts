import { Helpers as Help } from "./Helpers";
import { UsersRoles, ViewUsersModel } from "../types/user";
import { connect } from "../db";
import { rejects } from "assert";
import { Db } from "mongodb";

const Helpers = new Help(connect);

export class Methods {
    connect: any;
    constructor(connect: any) {
        this.connect = connect();
    }

    public GetUser = (token: string) => {
        return new Promise(async (res, rej) => {
            try {
                (await this.connect)
                    .collection("users")
                    .find({ token })
                    .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        };
                        if (result.length === 0) {
                            rej(Helpers.CreateError("User is not defined", 404));
                        };
                        res(result[0]);
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

    public GetAuth = (nickname: string) => {
        return new Promise(async (res, rej) => {
            try {
                (await this.connect)
                    .collection("auth")
                    .find({ nickname })
                    .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        };
                        if (result.length > 0) {
                            res(result[0]);
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
                this.GetAuth(nickname)
                    .then((r) => {
                        rej(Helpers.CreateError("User is auth", 400));
                    })
                    .catch(async (e) => {
                        (await this.connect).collection("users").find({ nickname }).toArray(async (er, rl) => {
                            console.log(rl, nickname)
                            if (er) {
                                rej(er);
                            };
                            if (rl.length === 0) {
                                rej(er);
                            };
                            if (Helpers.IsValidPassword(password, rl[0].password)) {
                                const token = Helpers.CreateToken(rl[0].nickname);
                                (await this.connect).collection("users").replaceOne({ nickname: rl[0].nickname }, { ...rl[0], token });
                                (await this.connect).collection("auth").insertOne({ nickname, token });
                                res(token);
                            };
                            rej(Helpers.CreateError("Password is not valid", 400));
                        });
                    });
            } catch(e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };
};