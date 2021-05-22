import { ObjectId } from "mongodb";

export interface CityModel {
    _id?: string|ObjectId;
    name?: string;
}