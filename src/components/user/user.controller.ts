import { NextFunction, Router, Request, Response } from "express";
import { ApiError, catchErrors, isUuidValid, resSuccess, validate } from "../../utils";
import { loginSchema, registerSchema, userErrorsLib, UserModel, userSchema, userService } from "./";
import * as passportConfig from "../../config/passport";

const router = Router();

/**
 * @swagger
 * definitions:
 *   User:
 *    properties:
 *      userId:
 *        type: string
 *      email:
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
 *      email:
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
 */
router.get(
    "/users",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
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
    passportConfig.isAuthenticated,
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
    // TODO: add auth middleware here
    catchErrors(async (req: Request, res: Response) => {
        const user = validate(req.body, registerSchema);
        const result = await userService.addUser(user);
        return resSuccess(201, result);
    })
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags:
 *       - User
 *     security:
 *       - Bearer: []
 *     description: Update user by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
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
 *       410:
 *         description: User's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.patch(
    "/users/:userId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
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
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const result = await userService.logout(req.get("authorization"));
        return resSuccess(200, result);
    })
);

export const userController = router;