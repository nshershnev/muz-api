import { partnerErrorsLib, PartnerModel } from "./";
import { ApiError, db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

// we may use dbConnection only in repository

class PartnerRepository {
    private projection: any = { _id: 0, password: 0 };

    public async getPartnerById(partnerId: string): Promise<PartnerModel> {
        return db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERS_COLLECTION)
            .findOne(
                { partnerId },
                { projection: this.projection }
            );
    }

    public async getAllPartners(): Promise<Array<PartnerModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERS_COLLECTION)
            .find({}, { projection: this.projection })
            .toArray();
    }

    public async addPartner(partner: PartnerModel): Promise<PartnerModel> {
        const newPartner = await db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERS_COLLECTION)
            .insertOne(partner);

        if (!newPartner.ops.length) {
            throw new ApiError(partnerErrorsLib.partnerIsNotCreated);
        }

        return partner;
    }

    public async updatePartner(partnerId: string, partner: PartnerModel) {
        const updatedPartner = await db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERS_COLLECTION)
            .updateOne(
                { partnerId },
                { $set: partner }
            );

        if (updatedPartner.result.n === 0) {
            throw new ApiError(partnerErrorsLib.partnerNotFound);
        }

        return {
            ...partner,
            partnerId
        };
    }

    public async removePartner(partnerId: string) {
        const removedPartner = await db.Context
            .collection(MONGO_COLLECTIONS.PARTHNERS_COLLECTION)
            .deleteOne({ partnerId });

        if (removedPartner.result.n === 0) {
            throw new ApiError(partnerErrorsLib.partnerNotFound);
        }

        return { partnerId };
    }
}

export const partnerRepository = new PartnerRepository();