export enum UsersRoles {
    User,
    Editor,
    Admin
};

export type ViewUsersModel = {
    email: string;
    password: string;
    nickname: string;
    creationDate: Date;
};