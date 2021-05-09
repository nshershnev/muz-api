import { AccessTokenModel, userErrorsLib } from "./";
import { ApiError, db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

class WhiteListRepository {

    public async getToken(token: string): Promise<AccessTokenModel> {
        return db.Context
            .collection(MONGO_COLLECTIONS.WHITE_LIST_COLLECTION)
            .findOne({
                token,
                expires_date_time: { $gte: new Date() }
            });
    }

    public async updateToken(token: string, tokenData: AccessTokenModel): Promise<AccessTokenModel> {
        const updatedToken = await db.Context
            .collection(MONGO_COLLECTIONS.WHITE_LIST_COLLECTION)
            .updateOne(
                { token },
                { $set: tokenData }
            );

        if (updatedToken) {
            return tokenData;
        }
        else {
            throw new Error("Token not found");
        }
    }

    public async upsertToken(userId: string, token: AccessTokenModel): Promise<AccessTokenModel> {
        const addedToken = await db.Context
            .collection(MONGO_COLLECTIONS.WHITE_LIST_COLLECTION)
            .updateOne(
                { userId },
                { $set: token },
                { upsert: true }
            );

        if (addedToken) {
            return token;
        }
        else {
            throw new ApiError(userErrorsLib.tokenIsNotCreated);
        }
    }
}

export const whiteListRepository = new WhiteListRepository();