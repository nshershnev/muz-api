import { CityModel } from "./";
import { db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

class CityRepository {
    private projection: any = { _id: 0 };

    public async getAllCities(): Promise<Array<CityModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.CITIES_COLLECTION)
            .find({}, { projection: this.projection })
            .toArray();
    }
}

export const cityRepository = new CityRepository();