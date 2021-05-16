import { eventErrorsLib, EventModel } from "./";
import { ApiError, db } from "../../utils";
import { MONGO_COLLECTIONS } from "../../shared/constants";

// we may use dbConnection only in repository

class EventRepository {
    private projection: any = { _id: 0, password: 0 };

    public async getEventById(eventId: string): Promise<EventModel> {
        return db.Context
            .collection(MONGO_COLLECTIONS.EVENTS_COLLECTION)
            .findOne(
                { eventId },
                { projection: this.projection }
            );
    }

    public async getAllEvents(): Promise<Array<EventModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.EVENTS_COLLECTION)
            .find({}, { projection: this.projection })
            .toArray();
    }

    public async addEvent(event: EventModel): Promise<EventModel> {
        const newEvent = await db.Context
            .collection(MONGO_COLLECTIONS.EVENTS_COLLECTION)
            .insertOne(event);

        if (!newEvent.ops.length) {
            throw new ApiError(eventErrorsLib.eventIsNotCreated);
        }

        return event;
    }

    public async updateEvent(eventId: string, event: EventModel) {
        const updatedEvent = await db.Context
            .collection(MONGO_COLLECTIONS.EVENTS_COLLECTION)
            .updateOne(
                { eventId },
                { $set: event }
            );

        if (updatedEvent.result.n === 0) {
            throw new ApiError(eventErrorsLib.eventNotFound);
        }

        return {
            ...event,
            eventId
        };
    }

    public async searchEvents(event: any): Promise<Array<EventModel>> {
        return db.Context
            .collection(MONGO_COLLECTIONS.EVENTS_COLLECTION)
            .find({ ...event }, { projection: this.projection })
            .toArray();
    }

    public async removeEvent(eventId: string) {
        const removedEvent = await db.Context
            .collection(MONGO_COLLECTIONS.EVENTS_COLLECTION)
            .deleteOne({ eventId });

        if (removedEvent.result.n === 0) {
            throw new ApiError(eventErrorsLib.eventNotFound);
        }

        return { eventId };
    }
}

export const eventRepository = new EventRepository();