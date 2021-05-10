import { ErrorLibrary } from "../../utils";

export const partnershipErrorsLib: ErrorLibrary = {
    partnershipNotFound: {
        status: 404,
        message: "Partnership not found"
    },
    partnershipIdIsNotValid: {
        status: 410,
        message: "Partnership's id is not valid"
    },
    partnershipIsNotCreated: {
        status: 500,
        message: "Partnership is not created"
    }
};