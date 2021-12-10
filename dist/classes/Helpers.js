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
            return jsonwebtoken_1.default.sign({ email }, "MySuP3R_z3kr3t", { expiresIn: "6h" });
            ;
        };
        this.CreatePassword = (password) => {
            return bcrypt_1.default.hashSync(password, bcrypt_1.default.genSaltSync(10), null);
        };
        this.IsValidPassword = (password, getPassword) => {
            return bcrypt_1.default.compareSync(password, getPassword);
        };
        this.CreateError = (error, status) => {
            return { error, status };
        };
    }
}
exports.Helpers = Helpers;
;
//# sourceMappingURL=Helpers.js.map