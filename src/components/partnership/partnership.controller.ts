import { Router, Request, Response } from "express";
import { ApiError, catchErrors, isUuidValid, resSuccess, validate } from "../../utils";
import { partnershipErrorsLib, PartnershipModel, partnershipSchema, partnershipService } from ".";
import * as passportConfig from "../../config/passport";
import { UserRole } from "../../shared/enums";

const router = Router();

/**
 * @swagger
 * definitions:
 *   Partnership:
 *    properties:
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
 *   Error:
 *    properties:
 *      message:
 *        type: string
 */

/**
 * @swagger
 * /partnerships:
 *   get:
 *     tags:
 *       - Partnership
 *     security:
 *       - Bearer: []
 *     description: Get all partnerships
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of partnerships
 *         properties:
 *           content:
 *             type: array
 *             items:
 *                $ref: '#/definitions/Partnership'
 *       401:
 *         description: Unauthorized user
 */
router.get(
    "/partnerships",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const partnerships = await partnershipService.getAllPartnerships();
        return resSuccess(200, partnerships);
    })
);

/**
 * @swagger
 * /partnerships/{partnershipId}:
 *   get:
 *     tags:
 *       - Partnership
 *     security:
 *       - Bearer: []
 *     description: Get partnership by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partnershipId
 *         description: Partnership's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single partnership
 *         properties:
 *           content:
 *              $ref: '#/definitions/Partnership'
 *       401:
 *         description: Unauthorized user
 *       404:
 *         description: Partnership not found
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       410:
 *         description: Partnership's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.get(
    "/partnerships/:partnershipId",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const { partnershipId } = req.params;

        if (!isUuidValid(partnershipId)) {
            throw new ApiError(partnershipErrorsLib.partnershipIdIsNotValid);
        }

        const partnership: PartnershipModel = await partnershipService.getPartnershipById(partnershipId);
        return resSuccess(200, partnership);
    })
);

/**
 * @swagger
 * /partnerships:
 *   post:
 *     tags:
 *       - Partnership
 *     security:
 *       - Bearer: []
 *     description: Create partnership
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partnership
 *         description: Partnership object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Partnership'
 *     responses:
 *       200:
 *         description: Created partnership
 *         properties:
 *           content:
 *              $ref: '#/definitions/Partnership'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 *       401:
 *         description: Unauthorized user
 */
router.post(
    "/partnerships",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const partnership = validate(req.body, partnershipSchema);
        const result = await partnershipService.addPartnership(partnership);
        return resSuccess(201, result);
    })
);

/**
 * @swagger
 * /partnerships/{partnershipId}:
 *   patch:
 *     tags:
 *       - Partnership
 *     security:
 *       - Bearer: []
 *     description: Update partnership by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partnershipId
 *         description: Partnership's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: partnership
 *         description: Partnership object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Partnership'
 *     responses:
 *       200:
 *         description: Updated partnership
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
 *         description: Partnership's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.patch(
    "/partnerships/:partnershipId",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const { partnershipId } = req.params;

        if (!isUuidValid(partnershipId)) {
            throw new ApiError(partnershipErrorsLib.partnershipIdIsNotValid);
        }

        const partnership = validate(req.body, partnershipSchema, true);
        const updatedPartnership = await partnershipService.updatePartnership(partnershipId, partnership, req.user);

        return resSuccess(200, updatedPartnership);
    })
);

/**
 * @swagger
 * /partnerships/search:
 *   post:
 *     tags:
 *       - Partnership
 *     security:
 *       - Bearer: []
 *     description: Returns found partnerships
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partnership
 *         description: Partnership object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Partnership'
 *     responses:
 *       200:
 *         description: An array of partnerships
 *         properties:
 *           content:
 *             type: array
 *             items:
 *               $ref: '#/definitions/Partnership'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 *       401:
 *         description: Unauthorized user
 */
router.post(
    "/partnerships/search",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const partnership = validate(req.body, partnershipSchema, true);
        const result = await partnershipService.searchPartnerships(partnership);
        return resSuccess(200, result);
    })
);

/**
 * @swagger
 * /partnerships/{partnershipId}:
 *   delete:
 *     tags:
 *       - Partnership
 *     security:
 *       - Bearer: []
 *     description: Remove partnership by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: partnershipId
 *         description: Partnership's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Removed partnership
 *         properties:
 *           content:
 *              $ref: '#/definitions/Partnership'
 *       401:
 *         description: Unauthorized user
 *       410:
 *         description: Partnership's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.delete(
    "/partnerships/:partnershipId",
    passportConfig.isAuthorized,
    passportConfig.isPermissed([UserRole.ADMIN, UserRole.USER]),
    catchErrors(async (req: Request, res: Response) => {
        const { partnershipId } = req.params;

        if (!isUuidValid(partnershipId)) {
            throw new ApiError(partnershipErrorsLib.partnershipIdIsNotValid);
        }

        const result = await partnershipService.removePartnership(partnershipId, req.user);
        return resSuccess(200, result);
    })
);

export const partnershipController = router;