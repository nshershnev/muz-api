import { vacancyErrorsLib, VacancyModel } from "./";
import { ApiError, db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

// we may use dbConnection only in repository

class VacancyRepository {
    private projection: any = { _id: 0, password: 0 };

    public async getVacancyById(vacancyId: string): Promise<VacancyModel> {
        return db.Context
            .collection(MONGO_COLLECTIONS.VACANCIES_COLLECTION)
            .findOne(
                { vacancyId },
                { projection: this.projection }
            );
    }

    public async getAllVacancies(): Promise<Array<VacancyModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.VACANCIES_COLLECTION)
            .find({}, { projection: this.projection })
            .toArray();
    }

    public async addVacancy(vacancy: VacancyModel): Promise<VacancyModel> {
        const newVacancy = await db.Context
            .collection(MONGO_COLLECTIONS.VACANCIES_COLLECTION)
            .insertOne(vacancy);

        if (!newVacancy.ops.length) {
            throw new ApiError(vacancyErrorsLib.vacancyIsNotCreated);
        }

        return vacancy;
    }

    public async updateVacancy(vacancyId: string, vacancy: VacancyModel) {
        const updatedVacancy = await db.Context
            .collection(MONGO_COLLECTIONS.VACANCIES_COLLECTION)
            .updateOne(
                { vacancyId },
                { $set: vacancy }
            );

        if (updatedVacancy.result.n === 0) {
            throw new ApiError(vacancyErrorsLib.vacancyNotFound);
        }

        return {
            ...vacancy,
            vacancyId
        };
    }

    public async removeVacancy(vacancyId: string) {
        const removedVacancy = await db.Context
            .collection(MONGO_COLLECTIONS.VACANCIES_COLLECTION)
            .deleteOne({ vacancyId });

        if (removedVacancy.result.n === 0) {
            throw new ApiError(vacancyErrorsLib.vacancyNotFound);
        }

        return { vacancyId };
    }
}

export const vacancyRepository = new VacancyRepository();