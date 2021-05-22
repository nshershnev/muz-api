import * as supertest from "supertest";
import { ObjectID } from "mongodb";

import { db, generateId } from "../src/utils";
import { appAsync } from "../src/app";
import { UserModel, userErrorsLib } from "../src/components/user";
import { MONGO_COLLECTIONS } from "../src/shared/constants";

describe("User", () => {
    let request: any;
    let user: any;

    const removeUsersWithTestEmail = async (email: string) => {
        await db.Context.collection(MONGO_COLLECTIONS.USERS_COLLECTION).deleteOne({ email });
    };

    const createUser: UserModel = {
        email: "test@example.com",
        password: "password"
    };

    const updateUserData = {
        email: "update@example.com"
    };

    beforeAll(async () => {
        const app = await appAsync;
        request = supertest(app);

        await removeUsersWithTestEmail(createUser.email);
        await removeUsersWithTestEmail(updateUserData.email);

        await request.post("/api/v1/users")
            .send(createUser)
            .then(({ body: { content } }) => {
                expect(content).toHaveProperty("message", `Success! User with ${createUser.email} was created`);
            });

        await request.post("/api/v1/login")
            .send(createUser)
            .then(({ body: { content } }) => {
                user = content;
            });
    });

    describe("POST /api/v1/users", () => {
        it("should return Email is already used", () => {
            return request.post("/api/v1/users")
                .send(createUser)
                .then(({ body: { error } }) => {
                    expect(error).toHaveProperty("message", userErrorsLib.emailIsAlreadyUsed.message);
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/users")
                .send({
                    email: "",
                    password: ""
                })
                .then(({ body: { error } }) => {
                    const [minLength, pattern] = error.errors;
                    expect(pattern).toHaveProperty("keyword", "pattern");

                    expect(minLength).toHaveProperty("keyword", "minLength");
                    expect(minLength).toHaveProperty("message", "should NOT be shorter than 9 characters");
                });
        });
    });

    describe("GET /api/v1/users", () => {
        it("should return List of users", () => {
            return request.get("/api/v1/users")
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    const isDefined = content.find(u => u.email === user.email);
                    expect(isDefined).toBeDefined();
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.get("/api/v1/users")
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });
    });

    describe("GET /api/v1/users/:userId", () => {
        it("should return User by id", () => {
            return request.get(`/api/v1/users/${user.userId}`)
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("userId", user.userId);
                    expect(content).toHaveProperty("email", user.email);
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.get(`/api/v1/users/${user.userId}`)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it(`should return ${userErrorsLib.userIdIsNotValid.message}`, () => {
            const testId = new ObjectID();
            return request.get(`/api/v1/users/${testId}`)
                .set({ Authorization: user.token })
                .expect(userErrorsLib.userIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.userIdIsNotValid.message);
                });
        });

        it(`should return ${userErrorsLib.userIdIsNotValid.message}`, () => {
            return request.get("/api/v1/users/1")
                .set({ Authorization: user.token })
                .expect(userErrorsLib.userIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.userIdIsNotValid.message);
                });
        });
    });

    describe("PATCH /api/v1/users/:userId", () => {

        it(`should return ${userErrorsLib.userIdIsNotValid.message}`, () => {
            return request.patch("/api/v1/users/1")
                .set({ Authorization: user.token })
                .send(updateUserData)
                .expect(userErrorsLib.userIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.userIdIsNotValid.message);
                });
        });

        it(`should return ${userErrorsLib.notEnoughPermissions.message}`, () => {
            const testId = generateId();
            return request.patch(`/api/v1/users/${testId}`)
                .set({ Authorization: user.token })
                .send(updateUserData)
                .expect(userErrorsLib.notEnoughPermissions.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.notEnoughPermissions.message);
                });
        });

        it("should return Changes for user object not found", () => {
            return request.patch(`/api/v1/users/${user.userId}`)
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toEqual({});
                });
        });

        it("should return Email is not valid", () => {
            const incorrectUpdateUserData = {
                email: "update"
            };
            return request.patch(`/api/v1/users/${user.userId}`)
                .set({ Authorization: user.token })
                .send(incorrectUpdateUserData)
                .expect(400)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("errors");
                });
        });

        it("should return An updated user", () => {
            return request.patch(`/api/v1/users/${user.userId}`)
                .set({ Authorization: user.token })
                .send(updateUserData)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("email", updateUserData.email);
                    expect(content).toHaveProperty("updatedAt");
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.patch(`/api/v1/users/${user.userId}`)
                .send(updateUserData)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

    });
});