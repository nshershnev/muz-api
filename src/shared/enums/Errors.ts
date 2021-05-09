import { ErrorLibrary } from "../../utils";

export const errorsLib: ErrorLibrary = {
    notValidRequestBody: {
        status: 422,
        message: "The body of your request is not valid json"
    }
};