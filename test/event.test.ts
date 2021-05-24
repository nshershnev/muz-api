import * as supertest from "supertest";
import * as bcrypt from "bcrypt-nodejs";
import { ObjectID } from "mongodb";

import { db, generateId } from "../src/utils";
import { appAsync } from "../src/app";
import { LoginUserModel, UserModel, userErrorsLib, userRepository } from "../src/components/user";
import { EventModel, eventErrorsLib } from "../src/components/event";
import { MONGO_COLLECTIONS } from "../src/shared/constants";

describe("Event", () => {
    let request: any;
    let user: any;

    const createUser: UserModel = {
        email: "event@example.com",
        password: "password",
        firstName: "Edison",
        lastName: "Delaney"
    };

    const currDate = new Date();
    const userId = generateId();

    const createUserWithDb: UserModel = {
        email: "event@example.com",
        userId,
        password: bcrypt.hashSync("password"),
        firstName: "Edison",
        lastName: "Delaney",
        role: "Admin",
        createdAt: currDate,
        updatedAt: currDate
    };

    const loginUser: LoginUserModel = {
        username: createUser.email,
        password: createUser.password
    };

    let event: EventModel = {
        description: "My personal event",
        date: currDate,
        address: "Vozdvizhenka Street, 10, Moscow, 125009, Russian Federation",
        city: "Moscow"
    };

    const updateEvent = {
        description: "My new personal event"
    };

    const searchEvent = {
        ...updateEvent,
    };

    const removeUserWithTestEmail = async (email: string) => {
        await db.Context.collection(MONGO_COLLECTIONS.USERS_COLLECTION).deleteOne({ email });
    };

    const removeTestEvent = async (description: string) => {
        await db.Context.collection(MONGO_COLLECTIONS.EVENTS_COLLECTION).deleteOne({ description });
    };

    beforeAll(async () => {
        const app = await appAsync;
        request = supertest(app);

        await removeUserWithTestEmail(createUser.email);
        await removeTestEvent(event.description);

        await userRepository.addUser(createUserWithDb);

        await request.post("/api/v1/login")
            .send(loginUser)
            .then(({ body }) => {
                user = body.content;
            });
    });

    describe("POST /api/v1/events", () => {
        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.post("/api/v1/events")
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it("should return new created Event", () => {
            return request.post("/api/v1/events")
                .set({ Authorization: user.token })
                .send(event)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    event = { ...event, ...content };
                    expect(content).toHaveProperty("description", event.description);
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/events")
                .set({ Authorization: user.token })
                .send({
                    description: "",
                    date: ""
                })
                .then(({ body: { error } }) => {
                    const [requiredCity, requiredAddress] = error.errors;
                    expect(requiredCity).toHaveProperty("keyword", "required");
                    expect(requiredAddress).toHaveProperty("keyword", "required");
                });
        });
    });

    describe("GET /api/v1/events", () => {
        it("should return List of events", () => {
            return request.get("/api/v1/events")
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    const isDefined = content.find(e => e.description === event.description);
                    expect(isDefined).toBeDefined();
                });
        });
    });

    describe("GET /api/v1/events/:eventId", () => {
        it("should return Event by id", () => {
            return request.get(`/api/v1/events/${event.eventId}`)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("description", event.description);
                    expect(content).toHaveProperty("city", event.city);
                });
        });

        it(`should return ${eventErrorsLib.eventNotFound.message}`, () => {
            const testId = generateId();
            return request.get(`/api/v1/events/${testId}`)
                .expect(eventErrorsLib.eventNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", eventErrorsLib.eventNotFound.message);
                });
        });

        it(`should return ${eventErrorsLib.eventIdIsNotValid.message}`, () => {
            const testId = new ObjectID();
            return request.get(`/api/v1/events/${testId}`)
                .expect(eventErrorsLib.eventIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", eventErrorsLib.eventIdIsNotValid.message);
                });
        });
    });

    describe("PATCH /api/v1/events/:eventId", () => {

        it(`should return ${eventErrorsLib.eventIdIsNotValid.message}`, () => {
            return request.patch("/api/v1/events/1")
                .set({ Authorization: user.token })
                .send(updateEvent)
                .expect(eventErrorsLib.eventIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", eventErrorsLib.eventIdIsNotValid.message);
                });
        });

        it(`should return ${eventErrorsLib.eventNotFound.message}`, () => {
            const testId = generateId();
            return request.patch(`/api/v1/events/${testId}`)
                .set({ Authorization: user.token })
                .send(updateEvent)
                .expect(eventErrorsLib.eventNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", eventErrorsLib.eventNotFound.message);
                });
        });

        it("should return Changes for user object not found", () => {
            return request.patch(`/api/v1/events/${event.eventId}`)
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toEqual({});
                });
        });

        it("should return Phone number is not valid", () => {
            const incorrectUpdateEventData = {
                phoneNumber: "1"
            };
            return request.patch(`/api/v1/events/${event.eventId}`)
                .set({ Authorization: user.token })
                .send(incorrectUpdateEventData)
                .expect(400)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("errors");
                });
        });

        it("should return An updated event", () => {
            return request.patch(`/api/v1/events/${event.eventId}`)
                .set({ Authorization: user.token })
                .send(updateEvent)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("description", updateEvent.description);
                    expect(content).toHaveProperty("updatedAt");
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.patch(`/api/v1/users/${user.userId}`)
                .send(updateEvent)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

    });

    describe("POST /api/v1/events/search", () => {

        it("should return Event by search object", () => {
            return request.post("/api/v1/events/search")
                .set({ Authorization: user.token })
                .send(searchEvent)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    const isDefined = content.find(e => e.description === searchEvent.description);
                    expect(isDefined).toBeDefined();
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/users/search")
                .set({ Authorization: user.token })
                .send({ phoneNumber: "" })
                .then(({ body: { error } }) => {
                    const [pattern] = error.errors;
                    expect(pattern).toHaveProperty("keyword", "pattern");
                });
        });
    });


    describe("DELETE /api/v1/events/:eventId", () => {

        it(`should return ${eventErrorsLib.eventNotFound.message}`, () => {
            const testId = generateId();
            return request.delete(`/api/v1/events/${testId}`)
                .set({ Authorization: user.token })
                .expect(eventErrorsLib.eventNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", eventErrorsLib.eventNotFound.message);
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.delete(`/api/v1/events/${user.userId}`)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it(`should return ${eventErrorsLib.eventIdIsNotValid.message}`, () => {
            return request.delete("/api/v1/events/1")
                .set({ Authorization: user.token })
                .expect(eventErrorsLib.eventIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", eventErrorsLib.eventIdIsNotValid.message);
                });
        });

    });

});