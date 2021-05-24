import { isEmpty } from "lodash";

import { UserRole } from "../../shared/enums";
import { ApiError, generateId } from "../../utils";
import { userErrorsLib, UserModel } from "../user";
import { partnershipErrorsLib, partnershipRepository, PartnershipModel } from "./";

class PartnershipService {
    public async addPartnership(partnership: PartnershipModel) {
        const partnershipId = generateId();
        const currDate = new Date();

        const newPartnership: PartnershipModel = {
            ...partnership,
            partnershipId,
            createdAt: currDate,
            updatedAt: currDate
        };

        const addedPartnership: PartnershipModel = await partnershipRepository.addPartnership(newPartnership);
        return addedPartnership;
    }

    public async getPartnershipById(partnershipId: string): Promise<PartnershipModel> {
        const partnership: PartnershipModel = await partnershipRepository.getPartnershipById(partnershipId);
        if (!partnership) {
            throw new ApiError(partnershipErrorsLib.partnershipNotFound);
        }
        return partnership;
    }

    public async getAllPartnerships(): Promise<Array<PartnershipModel>> {
        const partnerships: Array<PartnershipModel> = await partnershipRepository.getAllPartnerships();
        return partnerships;
    }

    public async searchPartnerships(partnership: PartnershipModel) {
        const partnerships: Array<PartnershipModel> = await partnershipRepository.searchPartnerships(partnership);
        return partnerships;
    }

    public async updatePartnership(partnershipId: string, partnership: any, user: UserModel): Promise<any> {
        if (isEmpty(partnership)) {
            return {};
        }

        const partnershipToUpdate: PartnershipModel = await partnershipRepository.getPartnershipById(partnershipId);

        if (partnershipToUpdate && partnershipToUpdate.userId !== user.userId && user.role === UserRole.USER) {
            throw new ApiError(userErrorsLib.notEnoughPermissions);
        }

        const currDate = new Date();

        const partnershipUpdates = {
            ...partnership,
            updatedAt: currDate,
        };

        const updatedPartnership: any = await partnershipRepository.updatePartnership(partnershipId, partnershipUpdates);
        return updatedPartnership;
    }

    public async removePartnership(partnershipId: string, user: UserModel): Promise<any> {
        const partnershipToRemove: PartnershipModel = await partnershipRepository.getPartnershipById(partnershipId);

        if (partnershipToRemove && partnershipToRemove.userId !== user.userId && user.role === UserRole.USER) {
            throw new ApiError(userErrorsLib.notEnoughPermissions);
        }

        const removedPartnership: any = await partnershipRepository.removePartnership(partnershipId);
        return { message: `Success! Partnership with ${removedPartnership.partnershipId} was removed` };
    }
}

export const partnershipService = new PartnershipService();