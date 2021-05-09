import { Request, Response, NextFunction } from "express";

export interface IApiError {
    status: number;
    message: string;
}

export class ApiError extends Error {
    public status: number;

    constructor(err: IApiError) {
        super(err.message);
        this.status = err.status;
    }
}

export interface ErrorLibrary {
    [field: string]: IApiError;
}

export const catchErrors = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next))
        .then((data) => {
            if (data && data.content && data.status) {
                return res.status(data.status).json({ content: data.content });
            }
        })
        .catch(({ errors, message, status }: ApiError) => {
            const response = errors
                ? { error: { errors } }
                : { error: { message } };

            return res.status(status || 500).json(response);
        });
};