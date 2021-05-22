import { ObjectId } from "mongodb";

export interface GenreModel {
    _id?: string|ObjectId;
    name?: string;
    additionalName?: string;
}