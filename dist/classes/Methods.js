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
const Helpers = new Helpers_1.Helpers();
class Methods {
    constructor(connect) {
        this.GetUser = (token) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                const conn = this.connect();
                try {
                    (yield conn)
                        .collection("users")
                        .find({ token })
                        .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError(err, 500));
                        }
                        ;
                        if (result.length === 0) {
                            rej(Helpers.CreateError("User is not defined", 404));
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
        this.CreateUser = (email, password) => {
            return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                const conn = this.connect();
                try {
                    (yield conn)
                        .collection("users")
                        .find({ email })
                        .toArray((err, result) => {
                        if (err) {
                            rej(Helpers.CreateError("User already exist", 404));
                        }
                        ;
                        res([]);
                    });
                }
                catch (e) {
                    rej(Helpers.CreateError(e, 500));
                }
                ;
            }));
        };
        this.connect = connect;
    }
    ;
}
exports.Methods = Methods;
;
//# sourceMappingURL=Methods.js.map