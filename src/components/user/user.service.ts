import { Response, Request, NextFunction } from "express";
import { isEmpty } from "lodash";
import * as passport from "passport";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt-nodejs";

import { AccessTokenModel, userErrorsLib, userRepository, UserModel, whiteListRepository } from "./";
import { ApiError, generateId } from "../../utils";

class UserService {
    private accessTokenExpiresTimeMins: number = +process.env.ACCESS_TOKEN_EXPIRES_TIME_MINS;

    public async addUser(user: UserModel): Promise<UserModel> {
        const isEmailExists = await userRepository.getUserByEmail(user.email);
        if (isEmailExists) {
            throw new ApiError(userErrorsLib.emailIsAlreadyUsed);
        }

        const { password } = user;
        const userId = generateId();
        const currDate = new Date();

        const newUser: UserModel = {
            ...user,
            userId,
            password: bcrypt.hashSync(password),
            createdAt: currDate,
            updatedAt: currDate
        };

        const addedUser: UserModel = await userRepository.addUser(newUser);

        const {
            _id,
            ...restProps
        } = addedUser;

        return {
            ...restProps,
            password,
        };
    }

    public async getUserById(userId: string): Promise<UserModel> {
        const user: UserModel = await userRepository.getUserById(userId);
        if (!user) {
            throw new ApiError(userErrorsLib.userNotFound);
        }
        return user;
    }

    public async getUserByEmail(email: string): Promise<UserModel> {
        const user: UserModel = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new ApiError(userErrorsLib.userNotFound);
        }
        return user;
    }

    public async getAllUsers(): Promise<Array<UserModel>> {
        const users: Array<UserModel> = await userRepository.getAllUsers();
        return users;
    }

    public async updateUser(userId: string, user: any): Promise<any> {
        if (isEmpty(user)) {
            return {};
        }

        if (user.email) {
            const searchEmail = user.email.toLowerCase();
            const userData = await userRepository.getUserByEmail(searchEmail);
            if (userData && userData.userId !== userId) {
                throw new ApiError(userErrorsLib.emailIsAlreadyUsed);
            }
        }

        const currDate = new Date();

        const userUpdates = {
            ...user,
            updatedAt: currDate,
        };

        const updatedUser: any = await userRepository.updateUser(userId, userUpdates);
        return updatedUser;
    }

    private getExpiresDateTime(addMinsToDate: number, date: any = new Date()): Date {
        return new Date((new Date(date)).getTime() + (addMinsToDate * 60 * 1000));
    }

    public async isValidToken(token: string): Promise<boolean> {
        let isValidToken = false;
        let accessToken: AccessTokenModel = undefined;
        try {
            accessToken = await whiteListRepository.getToken(token);
            if (accessToken) {
                isValidToken = true;
                whiteListRepository.updateToken(token, { expires_date_time: this.getExpiresDateTime(this.accessTokenExpiresTimeMins) })
                    .catch((err: Error) => {
                        console.log("Token expire time not updated");
                        console.log(err.stack);
                    });
            }
        }
        catch (err) {
            console.log(err.message);
        }
        return isValidToken;
    }

    public login(req: Request, res: Response, next: NextFunction) {
        return new Promise((resolve, reject) => {
            passport.authenticate("local", (err: Error, user: UserModel, info: any) => {
                if (err) {
                    reject(err);
                }
                if (!user) {
                    reject(new ApiError(userErrorsLib.incorrectUsernameOrPassword));
                }
                req.logIn(user, (err: Error) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        const {
                            _id,
                            password,
                            ...restProps
                        } = user;

                        const authUser = {
                            token: `Bearer ${jwt.sign(user, process.env.SESSION_SECRET)}`,
                            ...restProps,
                        };

                        whiteListRepository.upsertToken(
                            authUser.userId, {
                            token: authUser.token,
                            expires_date_time: this.getExpiresDateTime(this.accessTokenExpiresTimeMins)
                        }
                        )
                            .then(() => resolve(authUser))
                            .catch(err => reject(err));
                    }
                });
            })(req, res, next);
        });
    }

    public async logout(token: string) {
        const addedToken = await whiteListRepository.updateToken(token, { expires_date_time: new Date() });
        return { message: "Success! You are logged out" };
    }
}

export const userService = new UserService();