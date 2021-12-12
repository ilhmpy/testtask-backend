import { Helpers as Help } from "./Helpers";

const Helpers = new Help();

export class DatabaseMethods {
    connect: any;
    constructor(connect: any) {
        this.connect = connect();
    };

    public Insert = async (collection: string, data) => {
        return new Promise(async (res, rej) => {
            try {
                (await this.connect)
                    .collection(collection)
                    .insertOne(data)
                        .then((rs) => res(rs))
                        .catch((err) => rej(err));
            } catch(e) {
                rej(e);
            };
        });
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

    public FindOne = (collection: string, find) => {
        return new Promise(async (res, rej) => {
            try {
                (await this.connect)
                    .collection(collection)
                    .findOne(find, (err, result) => {
                        console.log(result);
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
                            res(rs);
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
        return new Promise (async (res, rej) => {
            try {
                (await this.connect)
                    .collection(collection)
                    .deleteOne(deleteData)
                        .then((rs) => res(rs))
                        .catch((err) => rej(err));
            } catch(e) {
                rej(e);
            };
        });
    };
};