export enum UsersRoles {
    User,
    Editor,
    Admin
};

export type ViewUsersModel = {
    _id: string;
    password: string;
    nickname: string;
    creationDate: Date;
    confirmed: boolean;
    blocked: boolean;
    role: UsersRoles;
    token: string;
};