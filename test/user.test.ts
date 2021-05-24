import * as supertest from "supertest";
import * as bcrypt from "bcrypt-nodejs";
import { ObjectID } from "mongodb";

import { db, generateId } from "../src/utils";
import { appAsync } from "../src/app";
import { LoginUserModel, UserModel, userErrorsLib, userRepository } from "../src/components/user";
import { MONGO_COLLECTIONS } from "../src/shared/constants";

describe("User", () => {
    let request: any;
    let user: any;

    const createUser: UserModel = {
        email: "user@example.com",
        password: "password",
        firstName: "Edison",
        lastName: "Delaney"
    };

    const currDate = new Date();
    const userId = generateId();

    const createUserWithDb: UserModel = {
        email: "user@example.com",
        userId,
        password: bcrypt.hashSync("password"),
        firstName: "Edison",
        lastName: "Delaney",
        role: "Admin",
        createdAt: currDate,
        updatedAt: currDate
    };

    const createUserWithAPI: UserModel = {
        phoneNumber: "+12025550114",
        password: "password",
        firstName: "Nazia",
        lastName: "Frame"
    };

    const loginUser: LoginUserModel = {
        username: createUser.email,
        password: createUser.password
    };

    const updateUserData = {
        email: "update@example.com"
    };

    const searchUser = {
        email: createUser.email,
    };

    const removeTestUser = async (property: string, value: string) => {
        await db.Context.collection(MONGO_COLLECTIONS.USERS_COLLECTION).deleteOne({ [property]: value });
    };

    beforeAll(async () => {
        const app = await appAsync;
        request = supertest(app);

        await removeTestUser("email", createUser.email);
        await removeTestUser("email", updateUserData.email);
        await removeTestUser("phoneNumber", createUserWithAPI.phoneNumber);

        await userRepository.addUser(createUserWithDb);

        await request.post("/api/v1/login")
            .send(loginUser)
            .then(({ body }) => {
                user = body.content;
            });
    });

    describe("POST /api/v1/users", () => {
        it("should return Success! User with phoneNumber was created", () => {
            return request.post("/api/v1/users")
                .send(createUserWithAPI)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("message", `Success! User with ${createUserWithAPI.phoneNumber} was created`);
                });
        });

        it("should return Email is already used", () => {
            return request.post("/api/v1/users")
                .send(createUser)
                .then(({ body: { error } }) => {
                    expect(error).toHaveProperty("message", userErrorsLib.emailIsAlreadyUsed.message);
                });
        });

        it("should return Phone number is already used", () => {
            return request.post("/api/v1/users")
                .send(createUserWithAPI)
                .then(({ body: { error } }) => {
                    expect(error).toHaveProperty("message", userErrorsLib.phoneNumberIsAlreadyUsed.message);
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

        it(`should return ${userErrorsLib.userNotFound.message}`, () => {
            const testId = generateId();
            return request.get(`/api/v1/users/${testId}`)
                .set({ Authorization: user.token })
                .expect(userErrorsLib.userNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.userNotFound.message);
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
    });

    describe("POST /api/v1/users/search", () => {

        it("should return User by search object", () => {
            return request.post("/api/v1/users/search")
                .set({ Authorization: user.token })
                .send(searchUser)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    const isDefined = content.find(u => u.email === user.email);
                    expect(isDefined).toBeDefined();
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.post("/api/v1/users/search")
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/users/search")
                .set({ Authorization: user.token })
                .send({ email: "" })
                .then(({ body: { error } }) => {
                    const [minLength] = error.errors;
                    expect(minLength).toHaveProperty("keyword", "minLength");
                    expect(minLength).toHaveProperty("message", "should NOT be shorter than 9 characters");
                });
        });
    });

    describe("POST /api/v1/users/retore/card", () => {
        it("should send email to User to restore card  number", () => {
            return request.post("/api/v1/users/restore/card")
                .expect(200)
                .send({ email: user.email })
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("message", `Success! Card number has been sent to your email - ${user.email}`);
                });
        });

        it(`should return ${userErrorsLib.userNotFound.message}`, () => {
            return request.post("/api/v1/users/restore/card")
                .expect(userErrorsLib.userNotFound.status)
                .send({ email: "search@example.com" })
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.userNotFound.message);
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/users/restore/card")
                .set({ Authorization: user.token })
                .send({ email: "" })
                .then(({ body: { error } }) => {
                    const [minLength] = error.errors;
                    expect(minLength).toHaveProperty("keyword", "minLength");
                    expect(minLength).toHaveProperty("message", "should NOT be shorter than 9 characters");
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

    describe("DELETE /api/v1/users/:userId", () => {

        it("should login again", () => {
            return request.post("/api/v1/login")
                .send({
                    ...loginUser,
                    username: updateUserData.email
                })
                .then(({ body: { content } }) => {
                    user = content;
                });
        });

        it(`should return ${userErrorsLib.userNotFound.message}`, () => {
            const testId = generateId();
            return request.delete(`/api/v1/users/${testId}`)
                .set({ Authorization: user.token })
                .expect(userErrorsLib.userNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.userNotFound.message);
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.delete(`/api/v1/users/${user.userId}`)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it(`should return ${userErrorsLib.userIdIsNotValid.message}`, () => {
            return request.delete("/api/v1/users/1")
                .set({ Authorization: user.token })
                .expect(userErrorsLib.userIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.userIdIsNotValid.message);
                });
        });

    });
});