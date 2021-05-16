import { partnershipErrorsLib, PartnershipModel } from "./";
import { ApiError, db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

// we may use dbConnection only in repository

class PartnershipRepository {
    private projection: any = { _id: 0, password: 0 };

    public async getPartnershipById(partnershipId: string): Promise<PartnershipModel> {
        return db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERSHIPS_COLLECTION)
            .findOne(
                { partnershipId },
                { projection: this.projection }
            );
    }

    public async getAllPartnerships(): Promise<Array<PartnershipModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERSHIPS_COLLECTION)
            .find({}, { projection: this.projection })
            .toArray();
    }

    public async addPartnership(partnership: PartnershipModel): Promise<PartnershipModel> {
        const newPartnership = await db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERSHIPS_COLLECTION)
            .insertOne(partnership);

        if (!newPartnership.ops.length) {
            throw new ApiError(partnershipErrorsLib.partnershipIsNotCreated);
        }

        return partnership;
    }

    public async updatePartnership(partnershipId: string, partnership: PartnershipModel) {
        const updatedPartnership = await db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERSHIPS_COLLECTION)
            .updateOne(
                { partnershipId },
                { $set: partnership }
            );

        if (updatedPartnership.result.n === 0) {
            throw new ApiError(partnershipErrorsLib.partnershipNotFound);
        }

        return {
            ...partnership,
            partnershipId
        };
    }

    public async searchPartnerships(partnership: any): Promise<Array<PartnershipModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERSHIPS_COLLECTION)
            .find({ ...partnership }, { projection: this.projection })
            .toArray();
    }

    public async removePartnership(partnershipId: string) {
        const removedPartnership = await db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERSHIPS_COLLECTION)
            .deleteOne({ partnershipId });

        if (removedPartnership.result.n === 0) {
            throw new ApiError(partnershipErrorsLib.partnershipNotFound);
        }

        return { partnershipId };
    }
}

export const partnershipRepository = new PartnershipRepository();