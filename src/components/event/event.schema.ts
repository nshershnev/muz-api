import { ObjectId } from "mongodb";

import { validationRegexLib as rules } from "../../utils/validation";

export interface EventModel {
    _id?: string | ObjectId;
    eventId?: string;
    city?: string;
    address?: string;
    phoneNumber?: string;
    logos?: Array<LogoModel>;
    description?: string;
    date?: string | Date;
    website?: string;
    twitter?: string;
    facebook?: string;
    vk?: string;
    instagram?: string;
    whatsapp?: string;
    latitude?: Number;
    longitude?: Number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface LogoModel {
    logoId?: string;
    url?: string;
    description?: string;
    extension?: string;
}

const logoSchema = {
    type: "object",
    properties: {
        url: {
            type: "string",
        },
        description: {
            type: "string",
        },
        extension: {
            type: "string",
        }
    },
    additionalProperties: false
};

export const eventSchema = {
    type: "object",
    properties: {
        city: {
            type: "string",
        },
        address: {
            type: "string",
        },
        phoneNumber: {
            type: "string",
            pattern: rules.phoneNumber.source,
        },
        logos: {
            type: "array",
            items: logoSchema,
            additionalItems: false,
            uniqueItems: true
        },
        description: {
            type: "string",
        },
        date: {
            type: "string"
        },
        website: {
            type: "string",
        },
        twitter: {
            type: "string",
        },
        facebook: {
            type: "string",
        },
        vk: {
            type: "string",
        },
        instagram: {
            type: "string",
        },
        whatsapp: {
            type: "string",
        },
        latitude: {
            type: "number",
        },
        longitude: {
            type: "number",
        },
    },
    required: ["description", "date", "address", "city"],
    additionalProperties: false
};