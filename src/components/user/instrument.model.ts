import { ObjectId } from "mongodb";

export interface InstrumentModel {
    _id?: string|ObjectId;
    title?: string;
    genitiveTitle?: string;
    genetiveForArtistTitle?: string;
}