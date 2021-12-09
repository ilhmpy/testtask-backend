import { Helpers as Help } from "./Helpers";

const Helpers = new Help();

export class Methods {
    connect: any;
    
    constructor(connect) {
      this.connect = connect;
    };

    public GetUser = (token: string) => {
        return new Promise(async (res, rej) => {
            const conn = this.connect();
            try {
                (await conn)
                    .collection("users")
                    .find({ token })
                    .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        };
                        if (result.length === 0) {
                            rej(Helpers.CreateError("User is not defined", 404));
                        };
                        res(result);
                    });
            } catch (e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };

    
    public CreateUser = (email: string, password: string) => {
        return new Promise(async (res, rej) => {
            const conn = this.connect();
            try {
                (await conn)
                    .collection("users")
                    .find({ email })
                    .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError("User already exist", 404));
                        };
                        res([]);
                    });
            } catch (e) {
                rej(Helpers.CreateError(e, 500));
            };
        });
    };
};