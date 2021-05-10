import { ErrorLibrary } from "../../utils";

export const userErrorsLib: ErrorLibrary = {
    noAuthenticated: {
        status: 401,
        message: "No authenticated"
    },
    unauthorized: {
        status: 401,
        message: "Unauthorized"
    },
    notEnoughPermissions: {
        status: 403,
        message: "Not enough permissions"
    },
    userNotFound: {
        status: 404,
        message: "User not found"
    },
    incorrectUsernameOrPassword: {
        status: 404,
        message: "Incorrect username or password"
    },
    emailIsAlreadyUsed: {
        status: 409,
        message: "Email is already used"
    },
    tokenIsNotValid: {
        status: 410,
        message: "Token is not valid"
    },
    userIdIsNotValid: {
        status: 410,
        message: "User's id is not valid"
    },
    userIsNotCreated: {
        status: 500,
        message: "User is not created"
    },
    tokenIsNotCreated: {
        status: 500,
        message: "Token is not created"
    }
};