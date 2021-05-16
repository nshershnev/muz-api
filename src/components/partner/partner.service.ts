import { isEmpty } from "lodash";

import { ApiError, generateId } from "../../utils";
import { LikeModel, partnerErrorsLib, partnerRepository, PartnerModel } from "./";

class PartnerService {
    public async addPartner(partner: PartnerModel) {
        const partnerId = generateId();
        const currDate = new Date();

        const newPartner: PartnerModel = {
            ...partner,
            partnerId,
            createdAt: currDate,
            updatedAt: currDate
        };

        const addedPartner: PartnerModel = await partnerRepository.addPartner(newPartner);
        return { message: `Success! Partner with ${addedPartner.partnerId} was created` };
    }

    public async getPartnerById(partnerId: string): Promise<PartnerModel> {
        const partner: PartnerModel = await partnerRepository.getPartnerById(partnerId);
        if (!partner) {
            throw new ApiError(partnerErrorsLib.partnerNotFound);
        }
        return partner;
    }

    public async getAllPartners(): Promise<Array<PartnerModel>> {
        const partners: Array<PartnerModel> = await partnerRepository.getAllPartners();
        return partners;
    }

    public async searchPartners(partner: PartnerModel) {
        const partners: Array<PartnerModel> = await partnerRepository.searchPartners(partner);
        return partners;
    }

    public async updatePartner(partnerId: string, partner: any): Promise<any> {
        if (isEmpty(partner)) {
            return {};
        }

        const currDate = new Date();

        const partnerUpdates = {
            ...partner,
            updatedAt: currDate,
        };

        const updatedPartner: any = await partnerRepository.updatePartner(partnerId, partnerUpdates);
        return updatedPartner;
    }

    public async removePartner(partnerId: string): Promise<any> {
        const removedPartner: any = await partnerRepository.removePartner(partnerId);
        return { message: `Success! Partner with ${removedPartner.partnerId} was removed` };
    }

    public async addLikeById(partnerId: string, like: LikeModel): Promise<any> {
        const likeId = generateId();
        const currDate = new Date();

        const newLike: LikeModel = {
            ...like,
            likeId,
            createdAt: currDate,
        };

        const updatedPartner: any = await partnerRepository.addLikeById(partnerId, newLike);
        return {};
    }
}

export const partnerService = new PartnerService();