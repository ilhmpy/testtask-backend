import { NewsViewModel } from "../types/news";

export interface NewsView {
    token: string;
    post: NewsViewModel;
};

export interface NewsState {
    id: string;
    token: string;
    confirmed: boolean;
};

export interface CommentsView {
    creatorId: null | number;
    nickname: string;
    email: string;
    text: string;
    creationDate: Date;
    newsId: string;
};

export interface DeleteNewsView {
    id: string;
    token: string;
};

export interface CommentsState {
    token: string;
    id: string;
    idx: number;
    confirmed: boolean;
};