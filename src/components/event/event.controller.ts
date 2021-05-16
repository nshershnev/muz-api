import { Router, Request, Response } from "express";
import { ApiError, catchErrors, isUuidValid, resSuccess, validate } from "../../utils";
import { eventErrorsLib, EventModel, eventSchema, eventService } from ".";
import * as passportConfig from "../../config/passport";

const router = Router();

/**
 * @swagger
 * definitions:
 *   Event:
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
 * /events:
 *   get:
 *     tags:
 *       - Event
 *     security:
 *       - Bearer: []
 *     description: Get all events
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of events
 *         properties:
 *           content:
 *             type: array
 *             items:
 *                $ref: '#/definitions/Event'
 */
router.get(
    "/events",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const events = await eventService.getAllEvents();
        return resSuccess(200, events);
    })
);

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     tags:
 *       - Event
 *     security:
 *       - Bearer: []
 *     description: Get event by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: eventId
 *         description: Event's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single event
 *         properties:
 *           content:
 *              $ref: '#/definitions/Event'
 *       404:
 *         description: Event not found
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       410:
 *         description: Event's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.get(
    "/events/:eventId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { eventId } = req.params;

        if (!isUuidValid(eventId)) {
            throw new ApiError(eventErrorsLib.eventIdIsNotValid);
        }

        const event: EventModel = await eventService.getEventById(eventId);
        return resSuccess(200, event);
    })
);

/**
 * @swagger
 * /events:
 *   post:
 *     tags:
 *       - Event
 *     security:
 *       - Bearer: []
 *     description: Create event
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: event
 *         description: Event object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Event'
 *     responses:
 *       200:
 *         description: Created event
 *         properties:
 *           content:
 *              $ref: '#/definitions/Event'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 */
router.post(
    "/events",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const event = validate(req.body, eventSchema);
        const result = await eventService.addEvent(event);
        return resSuccess(201, result);
    })
);

/**
 * @swagger
 * /events/{eventId}:
 *   patch:
 *     tags:
 *       - Event
 *     security:
 *       - Bearer: []
 *     description: Update event by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: eventId
 *         description: Event's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: event
 *         description: Event object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Event'
 *     responses:
 *       200:
 *         description: Updated event
 *         properties:
 *           content:
 *             type: object
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 *       410:
 *         description: Event's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.patch(
    "/events/:eventId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { eventId } = req.params;

        if (!isUuidValid(eventId)) {
            throw new ApiError(eventErrorsLib.eventIdIsNotValid);
        }

        const event = validate(req.body, eventSchema, true);
        const updatedEvent = await eventService.updateEvent(eventId, event);

        return resSuccess(200, updatedEvent);
    })
);

/**
 * @swagger
 * /events/search:
 *   post:
 *     tags:
 *       - Event
 *     security:
 *       - Bearer: []
 *     description: Returns found events
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: event
 *         description: Event object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Event'
 *     responses:
 *       200:
 *         description: An array of events
 *         properties:
 *           content:
 *             type: array
 *             items:
 *               $ref: '#/definitions/Event'
 *       400:
 *         description: Validation error
 *         properties:
 *           error:
 *             $ref: '#/definitions/Error'
 *       401:
 *         description: Unauthorized user
 */
 router.post(
    "/events/search",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const event = validate(req.body, eventSchema, true);
        const result = await eventService.searchEvents(event);
        return resSuccess(200, result);
    })
);

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     tags:
 *       - Event
 *     security:
 *       - Bearer: []
 *     description: Remove event by id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: eventId
 *         description: Event's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Removed event
 *         properties:
 *           content:
 *              $ref: '#/definitions/Event'
 *       410:
 *         description: Event's id is not valid
 *         properties:
 *           error:
 *              $ref: '#/definitions/Error'
 */
router.delete(
    "/events/:eventId",
    passportConfig.isAuthorized,
    passportConfig.isAuthenticated,
    catchErrors(async (req: Request, res: Response) => {
        const { eventId } = req.params;

        if (!isUuidValid(eventId)) {
            throw new ApiError(eventErrorsLib.eventIdIsNotValid);
        }

        const result = await eventService.removeEvent(eventId);
        return resSuccess(200, result);
    })
);

export const eventController = router;