export class Methods {
    connect: any;
    
    constructor(connect) {
      this.connect = connect;
    };

    public GetUser = (email: string) => {
        return new Promise(async (res, rej) => {
            const conn = this.connect();
            try {
                (await conn)
                    .collection("users")
                    .find({ email })
                    .toArray((err, result) => {
                        if (err) {
                            rej();
                        };
                        res(result);
                    });
            } catch {
                rej("User is not defined");
            };
        });
    };

    
    public CreateUser = (email: string) => {
        return new Promise(async (res, rej) => {
            const conn = this.connect();
            try {
                (await conn)
                    .collection("users")
                    .find({ email })
                    .toArray((err, result) => {
                        if (err) {
                            rej("User already exist");
                        };
                        res(result);
                    });
            } catch {
                rej("Can't create user");
            };
        });
    };
};