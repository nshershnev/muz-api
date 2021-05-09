import { ObjectId } from "mongodb";

export interface AccessTokenModel {
    _id?: string|ObjectId;
    userId?: string;
    expires_date_time?: string|Date;
    token?: string;
}