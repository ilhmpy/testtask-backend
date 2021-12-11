import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class Helpers {
    public CreateToken = (email: string) => {
        try {
            return jwt.sign({ email }, "MySuP3R_z3kr3t", { expiresIn: "6h" });;
        } catch(e) {
            console.log(e);
        }
    };

    public CreatePassword = (password: string) => {
        try {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
        } catch(e) {
            console.log(e);
        }
    };

    public IsValidPassword = (password: string, getPassword: string) => {
        try {
            console.log(password, getPassword);
            return bcrypt.compareSync(password, getPassword);
        } catch(e) {
            console.log(e);
        }
    };

    public CreateError = (error: string, status: number) => {
        try {
            const data = { error, status };
            return data;
        } catch(e) {
            console.log(e);
        }
    };
};