import { GenreModel } from "./";
import { db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

class GenreRepository {
    private projection: any = { _id: 0 };

    public async getAllGenres(): Promise<Array<GenreModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.GENRES_COLLECTION)
            .find({}, { projection: this.projection })
            .toArray();
    }
}

export const genreRepository = new GenreRepository();