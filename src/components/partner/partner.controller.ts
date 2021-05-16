import { Router, Request, Response } from "express";
import { ApiError, catchErrors, isUuidValid, resSuccess, validate } from "../../utils";
import { partnerErrorsLib, PartnerModel, partnerSchema, partnerService } from ".";
import * as passportConfig from "../../config/passport";

const router = Router();

/**
 * @swagger
 * definitions:
 *   Partner:
 *    properties:
 *      partnerId:
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
 * /partners:
 *   get:
 *     tags:
 *       - Partner
 *     security:
 *       - Bearer: []
 *     description: Get all partners
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of partners
 *         properties:
 *           content:
 *             type: array
 *             items:
 *                $ref: '#/definitions/Partner'
 */
router.get(
    "/partners",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const partners = await partnerService.getAllPartners();
        return resSuccess(200, partners);
    })
);

/**
 * @swagger
 * /partners/{partnerId}:
 *   get:
 *     tags:
 *       - Partner
 *     security:
 *       - Bearer: []
 *     description: Get partner by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partnerId
 *         description: Partner's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single partner
 *         properties:
 *           content:
 *              $ref: '#/definitions/Partner'
 *       404:
 *         description: Partner not found
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       410:
 *         description: Partner's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.get(
    "/partners/:partnerId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { partnerId } = req.params;

        if (!isUuidValid(partnerId)) {
            throw new ApiError(partnerErrorsLib.partnerIdIsNotValid);
        }

        const partner: PartnerModel = await partnerService.getPartnerById(partnerId);
        return resSuccess(200, partner);
    })
);

/**
 * @swagger
 * /partners:
 *   post:
 *     tags:
 *       - Partner
 *     security:
 *       - Bearer: []
 *     description: Create partner
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partner
 *         description: Partner object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Partner'
 *     responses:
 *       200:
 *         description: Created partner
 *         properties:
 *           content:
 *              $ref: '#/definitions/Partner'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 */
router.post(
    "/partners",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const partner = validate(req.body, partnerSchema);
        const result = await partnerService.addPartner(partner);
        return resSuccess(201, result);
    })
);

/**
 * @swagger
 * /partners/{partnerId}:
 *   patch:
 *     tags:
 *       - Partner
 *     security:
 *       - Bearer: []
 *     description: Update partner by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partnerId
 *         description: Partner's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: partner
 *         description: Partner object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Partner'
 *     responses:
 *       200:
 *         description: Updated partner
 *         properties:
 *           content:
 *             type: object
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       410:
 *         description: Partner's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.patch(
    "/partners/:partnerId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { partnerId } = req.params;

        if (!isUuidValid(partnerId)) {
            throw new ApiError(partnerErrorsLib.partnerIdIsNotValid);
        }

        const partner = validate(req.body, partnerSchema, true);
        const updatedPartner = await partnerService.updatePartner(partnerId, partner);

        return resSuccess(200, updatedPartner);
    })
);

/**
 * @swagger
 * /partners/search:
 *   post:
 *     tags:
 *       - Partner
 *     security:
 *       - Bearer: []
 *     description: Returns found partners
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partner
 *         description: Partner object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Partner'
 *     responses:
 *       200:
 *         description: An array of partners
 *         properties:
 *           content:
 *             type: array
 *             items:
 *               $ref: '#/definitions/Partner'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 *       401:
 *         description: Unauthorized user
 */
 router.post(
    "/partners/search",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const partner = validate(req.body, partnerSchema, true);
        const result = await partnerService.searchPartners(partner);
        return resSuccess(200, result);
    })
);

/**
 * @swagger
 * /partners/{partnerId}:
 *   delete:
 *     tags:
 *       - Partner
 *     security:
 *       - Bearer: []
 *     description: Remove partner by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partnerId
 *         description: Partner's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Removed partner
 *         properties:
 *           content:
 *              $ref: '#/definitions/Partner'
 *       410:
 *         description: Partner's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.delete(
    "/partners/:partnerId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { partnerId } = req.params;

        if (!isUuidValid(partnerId)) {
            throw new ApiError(partnerErrorsLib.partnerIdIsNotValid);
        }

        const result = await partnerService.removePartner(partnerId);
        return resSuccess(200, result);
    })
);

export const partnerController = router;