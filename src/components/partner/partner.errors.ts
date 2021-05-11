import { ErrorLibrary } from "../../utils";

export const partnerErrorsLib: ErrorLibrary = {
    partnerNotFound: {
        status: 404,
        message: "Partner not found"
    },
    partnerIdIsNotValid: {
        status: 410,
        message: "Partner's id is not valid"
    },
    partnerIsNotCreated: {
        status: 500,
        message: "Partner is not created"
    }
};