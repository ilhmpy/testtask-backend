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
exports.connect = void 0;
const mongodb_1 = require("mongodb");
const user_1 = require("./securityConfig/user");
const db = "TestTask-db";
const url = `mongodb+srv://${user_1.User.name}:${user_1.User.password}@cluster0.15eqf.mongodb.net/${db}?retryWrites=true&w=majority`;
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    let client;
    try {
        client = yield mongodb_1.MongoClient.connect(url);
    }
    catch (e) {
        console.log(e);
    }
    ;
    if (client) {
        return client.db(db);
    }
    ;
});
exports.connect = connect;
//# sourceMappingURL=db.js.map