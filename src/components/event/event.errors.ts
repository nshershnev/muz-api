import { ErrorLibrary } from "../../utils";

export const eventErrorsLib: ErrorLibrary = {
    eventNotFound: {
        status: 404,
        message: "Event not found"
    },
    eventIdIsNotValid: {
        status: 410,
        message: "Event's id is not valid"
    },
    eventIsNotCreated: {
        status: 500,
        message: "Event is not created"
    }
};