import { Response, Request, NextFunction } from "express";
import { isEmpty } from "lodash";
import * as passport from "passport";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt-nodejs";
import * as nodemailer from "nodemailer";

import {
    AccessTokenModel,
    CityModel,
    cityRepository,
    GenreModel,
    genreRepository,
    InstrumentModel,
    instrumentRepository,
    userErrorsLib,
    userRepository,
    UserModel,
    whiteListRepository
} from "./";
import { ApiError, generateCardNumber, generateId } from "../../utils";
import config from "../../config/convict";

class UserService {
    private accessTokenExpiresTimeMins: number = Number(config.get("expireTime.accessToken"));

    public async addUser(user: UserModel) {

        if (user.email && user.email.length > 0) {
            const isEmailExists = await userRepository.getUserByEmail(user.email);
            if (isEmailExists) {
                throw new ApiError(userErrorsLib.emailIsAlreadyUsed);
            }
        }

        if (user.phoneNumber && user.phoneNumber.length > 0) {
            const isPhoneNumberExists = await userRepository.getUserByPhoneNumber(user.phoneNumber);
            if (isPhoneNumberExists) {
                throw new ApiError(userErrorsLib.phoneNumberIsAlreadyUsed);
            }
        }

        const users: Array<UserModel> = await userRepository.getAllUsers();

        const { password } = user;
        const userId = generateId();
        const cardNumber = generateCardNumber(users.length + 1, 9, "");
        const currDate = new Date();

        const newUser: UserModel = {
            ...user,
            userId,
            password: bcrypt.hashSync(password),
            cardNumber,
            createdAt: currDate,
            updatedAt: currDate
        };

        const addedUser: UserModel = await userRepository.addUser(newUser);
        return { message: `Success! User with ${addedUser.email || addedUser.phoneNumber} was created` };
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

    public async searchUsers(user: UserModel) {
        const users: Array<UserModel> = await userRepository.searchUsers(user);
        return users;
    }

    public async removeUser(userId: string): Promise<any> {
        const removedUser: any = await userRepository.removeUser(userId);
        return { message: `Success! User with ${removedUser.userId} was removed` };
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

    public async getCities(): Promise<Array<CityModel>> {
        const cities: Array<CityModel> = await cityRepository.getAllCities();
        return cities;
    }

    public async getInstruments(): Promise<Array<InstrumentModel>> {
        const instruments: Array<InstrumentModel> = await instrumentRepository.getAllInstruments();
        return instruments;
    }

    public async getGenres(): Promise<Array<GenreModel>> {
        const genres: Array<GenreModel> = await genreRepository.getAllGenres();
        return genres;
    }

    public async restoreUser(user: UserModel) {
        const isUserExists = await userRepository.getUserByEmail(user.email);

        if (!isUserExists) {
            throw new ApiError(userErrorsLib.userNotFound);
        }

        const { cardNumber, email } = isUserExists;

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: config.get("mailing.email"),
                pass: config.get("mailing.password"),
            },
        });

        const mailOptions = {
            from: config.get("mailing.email"),
            to: email,
            subject: "Restore card number - Musicians of Russia",
            text: `Here is you card number - ${cardNumber}. Please use it to log in.`
        };

        await transporter.sendMail(mailOptions);
        return { message: `Success! Card number has been sent to your email - ${email}` };
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
                            createdAt,
                            updatedAt,
                            ...restProps
                        } = user;

                        const authUser = {
                            token: `Bearer ${jwt.sign(user, config.get("keys.sessionSecret"))}`,
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