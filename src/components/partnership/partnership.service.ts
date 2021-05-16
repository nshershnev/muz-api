import { isEmpty } from "lodash";

import { ApiError, generateId } from "../../utils";
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
        return { message: `Success! Partnership with ${addedPartnership.partnershipId} was created` };
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

    public async updatePartnership(partnershipId: string, partnership: any): Promise<any> {
        if (isEmpty(partnership)) {
            return {};
        }

        const currDate = new Date();

        const partnershipUpdates = {
            ...partnership,
            updatedAt: currDate,
        };

        const updatedPartnership: any = await partnershipRepository.updatePartnership(partnershipId, partnershipUpdates);
        return updatedPartnership;
    }

    public async removePartnership(partnershipId: string): Promise<any> {
        const removedPartnership: any = await partnershipRepository.removePartnership(partnershipId);
        return { message: `Success! Partnership with ${removedPartnership.partnershipId} was removed` };
    }
}

export const partnershipService = new PartnershipService();