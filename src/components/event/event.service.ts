import { isEmpty } from "lodash";

import { ApiError, generateId } from "../../utils";
import { eventErrorsLib, eventRepository, EventModel } from "./";

class EventService {
    public async addEvent(event: EventModel) {
        const eventId = generateId();
        const currDate = new Date();

        const newEvent: EventModel = {
            ...event,
            eventId,
            createdAt: currDate,
            updatedAt: currDate
        };

        const addedEvent: EventModel = await eventRepository.addEvent(newEvent);
        return { message: `Success! Event with ${addedEvent.eventId} was created` };
    }

    public async getEventById(eventId: string): Promise<EventModel> {
        const event: EventModel = await eventRepository.getEventById(eventId);
        if (!event) {
            throw new ApiError(eventErrorsLib.eventNotFound);
        }
        return event;
    }

    public async getAllEvents(): Promise<Array<EventModel>> {
        const events: Array<EventModel> = await eventRepository.getAllEvents();
        return events;
    }

    public async searchEvents(event: EventModel) {
        const events: Array<EventModel> = await eventRepository.searchEvents(event);
        return events;
    }

    public async updateEvent(eventId: string, event: any): Promise<any> {
        if (isEmpty(event)) {
            return {};
        }

        const currDate = new Date();

        const eventUpdates = {
            ...event,
            updatedAt: currDate,
        };

        const updatedEvent: any = await eventRepository.updateEvent(eventId, eventUpdates);
        return updatedEvent;
    }

    public async removeEvent(eventId: string): Promise<any> {
        const removedEvent: any = await eventRepository.removeEvent(eventId);
        return { message: `Success! Event with ${removedEvent.eventId} was removed` };
    }
}

export const eventService = new EventService();