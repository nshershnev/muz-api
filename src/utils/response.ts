import { Request, Response, NextFunction } from "express";

import { errorsLib } from "../shared/enums/Errors";

export interface ResSuccess {
    status: number;
    content: any;
    fileName?: string;
}

export const resSuccess = (status: number, content: any): ResSuccess => {
    return { status, content };
};

export const handleSyntaxErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
        const response = {
            error: {
                message: errorsLib.notValidRequestBody.message
            }
        };
        return res.status(errorsLib.notValidRequestBody.status).json(response);
    }
    return next();
};