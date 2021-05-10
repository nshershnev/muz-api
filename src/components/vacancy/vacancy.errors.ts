import { ErrorLibrary } from "../../utils";

export const vacancyErrorsLib: ErrorLibrary = {
    vacancyNotFound: {
        status: 404,
        message: "Vacancy not found"
    },
    vacancyIdIsNotValid: {
        status: 410,
        message: "Vacancy's id is not valid"
    },
    vacancyIsNotCreated: {
        status: 500,
        message: "Vacancy is not created"
    }
};