"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const port_1 = require("./consts/port");
const db_1 = require("./db");
const Methods_1 = require("./methods/Methods");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const Methods = new Methods_1.Methods(db_1.connect);
Methods.GetUser("jsih1236@gmail.com")
    .then((res) => console.log(res))
    .catch((e) => console.log(e));
app.listen(port_1.PORT, () => console.log(`Server started http://localhost:${port_1.PORT}`));
//# sourceMappingURL=index.js.map