import { ObjectId } from "mongodb";

import { validationRegexLib as rules } from "../../utils/validation";

export interface PartnerModel {
    _id?: string | ObjectId;
    partnerId?: string;
    alias?: string;
    category?: string;
    isVisible?: Boolean;
    city?: string;
    address?: string;
    phoneNumber?: string;
    logos?: Array<LogoModel>;
    description?: string;
    services?: Array<ServiceModel>;
    bonuses?: Array<BonusModel>;
    website?: string;
    email?: string;
    liveJornal?: string;
    twitter?: string;
    facebook?: string;
    vk?: string;
    instagram?: string;
    whatsapp?: string;
    capacity?: Number;
    conditions?: string;
    latitude?: Number;
    longitude?: Number;
    likes?: Array<LikeModel>;
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

interface ServiceModel {
    serviceId?: string;
    tags?: string;
    desription?: string;
}

const serviceSchema = {
    type: "object",
    properties: {
        tags: {
            type: "string",
        },
        desription: {
            type: "string",
        }
    },
    additionalProperties: false
};

interface BonusModel {
    bonusId?: string;
    desription?: string;
    discount?: number;
    usageTime?: string;
}

const bonusSchema = {
    type: "object",
    properties: {
        desription: {
            type: "string",
        },
        discount: {
            type: "number",
        },
        usageTime: {
            type: "string",
        }
    },
    additionalProperties: false
};

export interface LikeModel {
    likeId?: string;
    userId?: string;
    createdAt?: string | Date;
}

export const likeSchema = {
    type: "object",
    properties: {
        userId: {
            type: "string",
        },
    },
    required: ["userId"],
    additionalProperties: false
};

export const partnerSchema = {
    type: "object",
    properties: {
        alias: {
            type: "string",
        },
        category: {
            type: "string",
        },
        isVisible: {
            type: "Boolean",
        },
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
        services: {
            type: "array",
            items: serviceSchema,
            additionalItems: false,
            uniqueItems: true
        },
        bonuses: {
            type: "array",
            items: bonusSchema,
            additionalItems: false,
            uniqueItems: true
        },
        website: {
            type: "string",
        },
        email: {
            type: "string",
            pattern: rules.email.source,
            minLength: 9,
            maxLength: 255
        },
        liveJornal: {
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
        capacity: {
            type: "number",
        },
        conditions: {
            type: "string",
        },
        latitude: {
            type: "number",
        },
        longitude: {
            type: "number",
        },
        likes: {
            type: "array",
            items: likeSchema,
            additionalItems: false,
            uniqueItems: true
        }
    },
    additionalProperties: false
};