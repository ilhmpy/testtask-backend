"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Helpers {
    constructor() {
        this.CreateToken = (email) => {
            try {
                return jsonwebtoken_1.default.sign({ email }, "MySuP3R_z3kr3t", { expiresIn: "6h" });
                ;
            }
            catch (e) {
                console.log(e);
            }
        };
        this.CreatePassword = (password) => {
            try {
                return bcrypt_1.default.hashSync(password, bcrypt_1.default.genSaltSync(10), null);
            }
            catch (e) {
                console.log(e);
            }
        };
        this.IsValidPassword = (password, getPassword) => {
            try {
                console.log(password, getPassword);
                return bcrypt_1.default.compareSync(password, getPassword);
            }
            catch (e) {
                console.log(e);
            }
        };
        this.CreateError = (error, status) => {
            try {
                const data = { error, status };
                return data;
            }
            catch (e) {
                console.log(e);
            }
        };
    }
}
exports.Helpers = Helpers;
;
//# sourceMappingURL=Helpers.js.map