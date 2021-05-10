import { Router, Request, Response } from "express";
import { ApiError, catchErrors, isUuidValid, resSuccess, validate } from "../../utils";
import { vacancyErrorsLib, VacancyModel, vacancySchema, vacancyService } from ".";
import * as passportConfig from "../../config/passport";

const router = Router();

/**
 * @swagger
 * definitions:
 *   Vacancy:
 *    properties:
 *      vacancyId:
 *        type: string
 *      userId:
 *        type: string
 *      searchType:
 *        type: string
 *      searchFor:
 *        type: string
 *      city:
 *        type: string
 *      description:
 *        type: string
 *      requirements:
 *        type: string
 *      vk:
 *        type: string
 *      facebook:
 *        type: string
 *      phoneNumber:
 *        type: string
 *      email:
 *        type: string
 *      createdAt:
 *        type: string
 *        format: date-time
 *      updatedAt:
 *        type: string
 *        format: date-time
 *   Error:
 *    properties:
 *      message:
 *        type: string
 */

/**
 * @swagger
 * /vacancies:
 *   get:
 *     tags:
 *       - Vacancy
 *     security:
 *       - Bearer: []
 *     description: Get all vacancies
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of vacancies
 *         properties:
 *           content:
 *             type: array
 *             items:
 *                $ref: '#/definitions/Vacancy'
 */
router.get(
    "/vacancies",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const vacancies = await vacancyService.getAllVacancies();
        return resSuccess(200, vacancies);
    })
);

/**
 * @swagger
 * /vacancies/{vacancyId}:
 *   get:
 *     tags:
 *       - Vacancy
 *     security:
 *       - Bearer: []
 *     description: Get vacancy by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: vacancyId
 *         description: Vacancy's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single vacancy
 *         properties:
 *           content:
 *              $ref: '#/definitions/Vacancy'
 *       404:
 *         description: Vacancy not found
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       410:
 *         description: Vacancy's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.get(
    "/vacancies/:vacancyId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { vacancyId } = req.params;

        if (!isUuidValid(vacancyId)) {
            throw new ApiError(vacancyErrorsLib.vacancyIdIsNotValid);
        }

        const vacancy: VacancyModel = await vacancyService.getVacancyById(vacancyId);
        return resSuccess(200, vacancy);
    })
);

/**
 * @swagger
 * /vacancies:
 *   post:
 *     tags:
 *       - Vacancy
 *     security:
 *       - Bearer: []
 *     description: Create vacancy
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: vacancy
 *         description: Vacancy object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Vacancy'
 *     responses:
 *       200:
 *         description: Created vacancy
 *         properties:
 *           content:
 *              $ref: '#/definitions/Vacancy'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 */
router.post(
    "/vacancies",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const vacancy = validate(req.body, vacancySchema);
        const result = await vacancyService.addVacancy(vacancy);
        return resSuccess(201, result);
    })
);

/**
 * @swagger
 * /vacancies/{vacancyId}:
 *   patch:
 *     tags:
 *       - Vacancy
 *     security:
 *       - Bearer: []
 *     description: Update vacancy by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: vacancyId
 *         description: Vacancy's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: vacancy
 *         description: Vacancy object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Vacancy'
 *     responses:
 *       200:
 *         description: Updated vacancy
 *         properties:
 *           content:
 *             type: object
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       410:
 *         description: Vacancy's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.patch(
    "/vacancies/:vacancyId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { vacancyId } = req.params;

        if (!isUuidValid(vacancyId)) {
            throw new ApiError(vacancyErrorsLib.vacancyIdIsNotValid);
        }

        const vacancy = validate(req.body, vacancySchema, true);
        const updatedVacancy = await vacancyService.updateVacancy(vacancyId, vacancy);

        return resSuccess(200, updatedVacancy);
    })
);

/**
 * @swagger
 * /vacancies/{vacancyId}:
 *   delete:
 *     tags:
 *       - Vacancy
 *     security:
 *       - Bearer: []
 *     description: Remove vacancy by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: vacancyId
 *         description: Vacancy's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Removed vacancy
 *         properties:
 *           content:
 *              $ref: '#/definitions/Vacancy'
 *       410:
 *         description: Vacancy's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.delete(
    "/vacancies/:vacancyId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { vacancyId } = req.params;

        if (!isUuidValid(vacancyId)) {
            throw new ApiError(vacancyErrorsLib.vacancyIdIsNotValid);
        }

        const result = await vacancyService.removeVacancy(vacancyId);
        return resSuccess(200, result);
    })
);

export const vacancyController = router;