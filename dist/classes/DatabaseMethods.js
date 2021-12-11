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
exports.DatabaseMethods = void 0;
const Helpers_1 = require("./Helpers");
const Helpers = new Helpers_1.Helpers();
class DatabaseMethods {
    constructor(connect) {
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
                            res(rs);
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
    ;
}
exports.DatabaseMethods = DatabaseMethods;
;
//# sourceMappingURL=DatabaseMethods.js.map