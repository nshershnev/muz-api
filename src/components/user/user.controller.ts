import { NextFunction, Router, Request, Response } from "express";
import { ApiError, catchErrors, isUuidValid, resSuccess, validate } from "../../utils";
import {
    loginSchema,
    registerSchema,
    restoreUserSchema,
    userErrorsLib,
    UserModel,
    userSchema,
    userService
} from "./";
import * as passportConfig from "../../config/passport";
import { UserRole } from "../../shared/enums";

const router = Router();

/**
 * @swagger
 * definitions:
 *   City:
 *    properties:
 *      name:
 *        type: string
 *   Genre:
 *    properties:
 *      name:
 *        type: string
 *      additionalName:
 *        type: string
 *   Instrument:
 *    properties:
 *      title:
 *        type: string
 *      genitiveTitle:
 *        type: string
 *      genetiveForArtistTitle:
 *        type: string
 *   RestoreUser:
 *    properties:
 *      email:
 *        type: string
 *   User:
 *    properties:
 *      userId:
 *        type: string
 *      email:
 *        type: string
 *      phoneNumber:
 *        type: string
 *      instrument:
 *        type: string
 *      password:
 *        type: string
 *      firstName:
 *        type: string
 *      lastName:
 *        type: string
 *      createdAt:
 *        type: string
 *        format: date-time
 *      updatedAt:
 *        type: string
 *        format: date-time
 *   Login:
 *    properties:
 *      username:
 *        type: string
 *      password:
 *        type: string
 *   Error:
 *    properties:
 *      message:
 *        type: string
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - User
 *     security:
 *       - Bearer: []
 *     description: Get all users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of users
 *         properties:
 *           content:
 *             type: array
 *             items:
 *                $ref: '#/definitions/User'
 *       401:
 *         description: Unauthorized user
 */
router.get(
    "/users",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const users = await userService.getAllUsers();
        return resSuccess(200, users);
    })
);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     tags:
 *       - User
 *     security:
 *       - Bearer: []
 *     description: Get user by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single user
 *         properties:
 *           content:
 *              $ref: '#/definitions/User'
 *       401:
 *         description: Unauthorized user
 *       404:
 *         description: User not found
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       410:
 *         description: User's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.get(
    "/users/:userId",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const { userId } = req.params;

        if (!isUuidValid(userId)) {
            throw new ApiError(userErrorsLib.userIdIsNotValid);
        }

        // we shouldn't use repository here, only our service
        // don't forget about await in async functions
        const user: UserModel = await userService.getUserById(userId);

        // we may decorate something for beautify response if we want
        return resSuccess(200, user);
    })
);

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - User
 *     description: Create user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             password:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *     responses:
 *       200:
 *         description: Created user
 *         properties:
 *           content:
 *              $ref: '#/definitions/User'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 */
router.post(
    "/users",
    catchErrors(async (req: Request, res: Response) => {
        const user = validate(req.body, registerSchema);
        const result = await userService.addUser(user);
        return resSuccess(201, result);
    })
);

/**
 * @swagger
 * /users/{userId}:
 *   patch:
 *     tags:
 *       - User
 *     security:
 *       - Bearer: []
 *     description: Update user by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *     responses:
 *       200:
 *         description: Updated user
 *         properties:
 *           content:
 *             type: object
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       401:
 *         description: Unauthorized user
 *       410:
 *         description: User's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.patch(
    "/users/:userId",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const { userId } = req.params;

        if (!isUuidValid(userId)) {
            throw new ApiError(userErrorsLib.userIdIsNotValid);
        }

        if (req.user.userId !== userId) {
            throw new ApiError(userErrorsLib.notEnoughPermissions);
        }

        // validate body
        const user = validate(req.body, userSchema, true);

        // update user
        const updatedUser = await userService.updateUser(userId, user);

        return resSuccess(200, updatedUser);
    })
);

/**
 * @swagger
 * /users/search:
 *   post:
 *     tags:
 *       - User
 *     security:
 *       - Bearer: []
 *     description: Returns found users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: An array of users
 *         properties:
 *           content:
 *             type: array
 *             items:
 *               $ref: '#/definitions/User'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 *       401:
 *         description: Unauthorized user
 */
router.post(
    "/users/search",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const user = validate(req.body, userSchema, true);
        const result = await userService.searchUsers(user);
        return resSuccess(200, result);
    })
);


/**
 * @swagger
 * /users/restore/card:
 *   post:
 *     tags:
 *       - User
 *     description: Restore user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: Restore User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/RestoreUser'
 *     responses:
 *       200:
 *         description: Card number has been sent to your email
 *         properties:
 *           content:
 *             properties:
 *               message:
 *                 type: string
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 *       401:
 *         description: Unauthorized user
 */
 router.post(
    "/users/restore/card",
    catchErrors(async (req: Request, res: Response) => {
        const user = validate(req.body, restoreUserSchema, true);
        const result = await userService.restoreUser(user);
        return resSuccess(200, result);
    })
);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     tags:
 *       - User
 *     security:
 *       - Bearer: []
 *     description: Remove user by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Removed user
 *         properties:
 *           content:
 *              $ref: '#/definitions/User'
 *       401:
 *         description: Unauthorized user
 *       410:
 *         description: User's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.delete(
    "/users/:userId",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN]),
    catchErrors(async (req: Request, res: Response) => {
        const { userId } = req.params;

        if (!isUuidValid(userId)) {
            throw new ApiError(userErrorsLib.userIdIsNotValid);
        }

        const result = await userService.removeUser(userId);
        return resSuccess(200, result);
    })
);

/**
 * @swagger
 * /cities:
 *   get:
 *     tags:
 *       - City
 *     description: Returns cities
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of cities
 *         properties:
 *           content:
 *             type: array
 *             items:
 *               $ref: '#/definitions/City'
 *       401:
 *         description: Unauthorized user
 */
router.get(
    "/cities",
    catchErrors(async (req: Request, res: Response) => {
        const cities = await userService.getCities();
        return resSuccess(200, cities);
    })
);

/**
 * @swagger
 * /instruments:
 *   get:
 *     tags:
 *       - Instrument
 *     description: Returns instruments
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of instruments
 *         properties:
 *           content:
 *             type: array
 *             items:
 *               $ref: '#/definitions/Instrument'
 *       401:
 *         description: Unauthorized user
 */
router.get(
    "/instruments",
    catchErrors(async (req: Request, res: Response) => {
        const instruments = await userService.getInstruments();
        return resSuccess(200, instruments);
    })
);

/**
 * @swagger
 * /genres:
 *   get:
 *     tags:
 *       - Genre
 *     description: Returns genres
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of genres
 *         properties:
 *           content:
 *             type: array
 *             items:
 *               $ref: '#/definitions/Genre'
 *       401:
 *         description: Unauthorized user
 */
 router.get(
    "/genres",
    catchErrors(async (req: Request, res: Response) => {
        const genres = await userService.getGenres();
        return resSuccess(200, genres);
    })
);

/**
 * @swagger
 * /roles:
 *   get:
 *     tags:
 *       - Roles
 *     security:
 *       - Bearer: []
 *     description: Returns roles
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Roles object
 *         properties:
 *           content:
 *             type: array
 *             items:
 *               type: string
 *       401:
 *         description: Unauthorized user
 */
router.get(
    "/roles",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN]),
    catchErrors(async (req: Request, res: Response) => {
        const roles = userService.getRoles();
        return resSuccess(200, roles);
    })
);

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Login/Logout
 *     description: Login user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Login'
 *     responses:
 *       200:
 *         description: Success! You are logged in
 *         properties:
 *           content:
 *             properties:
 *               userId:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *               token:
 *                 type: string
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 *       404:
 *         description: Email not found or invalid email or password
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 */
router.post(
    "/login",
    catchErrors(async (req: Request, res: Response, next: NextFunction) => {
        const loginData: UserModel = validate(req.body, loginSchema, false);
        const result = await userService.login(req, res, next);
        return resSuccess(200, result);
    })
);

/**
 * @swagger
 * /logout:
 *   get:
 *     tags:
 *       - Login/Logout
 *     security:
 *       - Bearer: []
 *     description: Logout user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success! You are logged out
 *         properties:
 *           content:
 *             properties:
 *               message:
 *                 type: string
 *       401:
 *         description: Unauthorized user
 */
router.get(
    "/logout",
    passportConfig.isAuthorized,
    catchErrors(async (req: Request, res: Response) => {
        const result = await userService.logout(req.get("authorization"));
        return resSuccess(200, result);
    })
);

export const userController = router;