import { ObjectId } from "mongodb";

import { validationRegexLib as rules } from "../../utils/validation";

export interface PartnershipModel {
    _id?: string | ObjectId;
    partnershipId?: string;
    userId?: string;
    searchType?: string;
    searchFor?: string;
    city?: string;
    description?: string;
    requirements?: string;
    vk?: string;
    facebook?: string;
    phoneNumber?: string;
    email?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export const partnershipSchema = {
    type: "object",
    properties: {
        searchType: {
            type: "string",
        },
        searchFor: {
            type: "string",
        },
        city: {
            type: "string",
        },
        description: {
            type: "string",
        },
        requirements: {
            type: "string",
        },
        vk: {
            type: "string",
        },
        facebook: {
            type: "string",
        },
        email: {
            type: "string",
            pattern: rules.email.source,
            minLength: 9,
            maxLength: 255
        },
        phoneNumber: {
            type: "string",
            pattern: rules.phoneNumber.source,
        },
    },
    additionalProperties: false
};