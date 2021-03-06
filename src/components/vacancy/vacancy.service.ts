import { isEmpty } from "lodash";

import { UserRole } from "../../shared/enums";
import { ApiError, generateId } from "../../utils";
import { userErrorsLib, UserModel } from "../user";
import { vacancyErrorsLib, vacancyRepository, VacancyModel } from "./";

class VacancyService {
    public async addVacancy(vacancy: VacancyModel) {
        const vacancyId = generateId();
        const currDate = new Date();

        const newVacancy: VacancyModel = {
            ...vacancy,
            vacancyId,
            createdAt: currDate,
            updatedAt: currDate
        };

        const addedVacancy: VacancyModel = await vacancyRepository.addVacancy(newVacancy);
        return addedVacancy;
    }

    public async getVacancyById(vacancyId: string): Promise<VacancyModel> {
        const vacancy: VacancyModel = await vacancyRepository.getVacancyById(vacancyId);
        if (!vacancy) {
            throw new ApiError(vacancyErrorsLib.vacancyNotFound);
        }
        return vacancy;
    }

    public async getAllVacancies(): Promise<Array<VacancyModel>> {
        const users: Array<VacancyModel> = await vacancyRepository.getAllVacancies();
        return users;
    }

    public async updateVacancy(vacancyId: string, vacancy: any, user: UserModel): Promise<any> {
        if (isEmpty(vacancy)) {
            return {};
        }

        const vacancyToUpdate: VacancyModel = await vacancyRepository.getVacancyById(vacancyId);

        if (vacancyToUpdate && vacancyToUpdate.userId !== user.userId && user.role === UserRole.USER) {
            throw new ApiError(userErrorsLib.notEnoughPermissions);
        }

        const currDate = new Date();

        const vacancyUpdates = {
            ...vacancy,
            updatedAt: currDate,
        };

        const updatedVacancy: any = await vacancyRepository.updateVacancy(vacancyId, vacancyUpdates);
        return updatedVacancy;
    }

    public async searchVacancies(vacancy: VacancyModel) {
        const vacancies: Array<VacancyModel> = await vacancyRepository.searchVacancies(vacancy);
        return vacancies;
    }

    public async removeVacancy(vacancyId: string, user: UserModel): Promise<any> {
        const vacancyToRemove: VacancyModel = await vacancyRepository.getVacancyById(vacancyId);

        if (vacancyToRemove && vacancyToRemove.userId !== user.userId && user.role === UserRole.USER) {
            throw new ApiError(userErrorsLib.notEnoughPermissions);
        }

        const removedVacancy: any = await vacancyRepository.removeVacancy(vacancyId);
        return { message: `Success! Vacancy with ${removedVacancy.vacancyId} was removed` };
    }
}

export const vacancyService = new VacancyService();