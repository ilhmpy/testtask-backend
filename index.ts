import { PORT } from "./consts/port";
import { connect } from "./db";
import { Methods as Funcs } from "./methods/Methods";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const Methods = new Funcs(connect);

app.listen(PORT, () => console.log(`Server started http://localhost:${PORT}`));