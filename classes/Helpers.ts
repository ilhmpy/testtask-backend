import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class Helpers {
    connect: any;
    constructor(connect) {
        this.connect = connect();
    }; 

    public CreateToken = (email: string) => {
        return jwt.sign({ email }, "MySuP3R_z3kr3t", { expiresIn: "6h" });;
    };

    public CreatePassword = (password: string) => {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    };

    public IsValidPassword = (password: string, getPassword: string) => {
        return bcrypt.compareSync(password, getPassword);
    };

    public CreateError = (error: string, status: number) => {
        return { error, status };
    };
};