import { InstrumentModel } from "./";
import { db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

class InstrumentRepository {
    private projection: any = { _id: 0 };

    public async getAllInstruments(): Promise<Array<InstrumentModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.INSTRUMENTS_COLLECTION)
            .find({}, { projection: this.projection })
            .toArray();
    }
}

export const instrumentRepository = new InstrumentRepository();