import { userErrorsLib, UserModel } from "./";
import { ApiError, db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

// we may use dbConnection only in repository

class UserRepository {
    private projection: any = { _id: 0, password: 0 };

    public async getUserById(userId: string): Promise<UserModel> {
        return db.Context
            .collection(MONGO_COLLECTIONS.USERS_COLLECTION)
            .findOne(
                { userId },
                { projection: this.projection }
            );
    }

    public async getUserByEmail(email: string): Promise<UserModel> {
        return db.Context
            .collection(MONGO_COLLECTIONS.USERS_COLLECTION)
            .findOne({ email });
    }

    public async getUserByPhoneNumber(phoneNumber: string): Promise<UserModel> {
        return db.Context
            .collection(MONGO_COLLECTIONS.USERS_COLLECTION)
            .findOne({ phoneNumber });
    }

    public async getAllUsers(): Promise<Array<UserModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.USERS_COLLECTION)
            .find({}, { projection: this.projection })
            .toArray();
    }

    public async addUser(user: UserModel): Promise<UserModel> {
        const newUser = await db.Context
            .collection(MONGO_COLLECTIONS.USERS_COLLECTION)
            .insertOne(user);

        if (!newUser.ops.length) {
            throw new ApiError(userErrorsLib.userIsNotCreated);
        }

        return user;
    }

    public async updateUser(userId: string, user: UserModel) {
        const updatedUser = await db.Context
            .collection(MONGO_COLLECTIONS.USERS_COLLECTION)
            .updateOne(
                { userId },
                { $set: user }
            );

        if (updatedUser.result.n === 0) {
            throw new ApiError(userErrorsLib.userNotFound);
        }

        return {
            ...user,
            userId
        };
    }

    public async searchUsers(user: any): Promise<Array<UserModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.USERS_COLLECTION)
            .find({ ...user }, { projection: this.projection })
            .toArray();
    }

    public async removeUser(userId: string) {
        const removedUser = await db.Context
            .collection(MONGO_COLLECTIONS.USERS_COLLECTION)
            .deleteOne({ userId });

        if (removedUser.result.n === 0) {
            throw new ApiError(userErrorsLib.userNotFound);
        }

        return { userId };
    }
}

export const userRepository = new UserRepository();