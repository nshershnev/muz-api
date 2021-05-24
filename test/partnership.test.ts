import * as supertest from "supertest";
import * as bcrypt from "bcrypt-nodejs";
import { ObjectID } from "mongodb";

import { db, generateId } from "../src/utils";
import { appAsync } from "../src/app";
import { LoginUserModel, UserModel, userErrorsLib, userRepository } from "../src/components/user";
import { PartnershipModel, partnershipErrorsLib } from "../src/components/partnership";
import { MONGO_COLLECTIONS } from "../src/shared/constants";

describe("Partnership", () => {
    let request: any;
    let user: any;

    const createUser: UserModel = {
        email: "partnership@example.com",
        password: "password",
        firstName: "Edison",
        lastName: "Delaney"
    };

    const currDate = new Date();
    const userId = generateId();

    const createUserWithDb: UserModel = {
        email: "partnership@example.com",
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

    let partnership: PartnershipModel = {
        description: "We are looking for a good specialist",
        searchType: "Artist search band",
        searchFor: "Electric guitarist looking for a band"
    };

    const updatePartnership = {
        description: "My new personal specialit"
    };

    const searchPartnership = {
        ...updatePartnership,
    };

    const removeUserWithTestEmail = async (email: string) => {
        await db.Context.collection(MONGO_COLLECTIONS.USERS_COLLECTION).deleteOne({ email });
    };

    const removeTestPartnership = async (description: string) => {
        await db.Context.collection(MONGO_COLLECTIONS.PARTHNERSHIPS_COLLECTION).deleteOne({ description });
    };

    beforeAll(async () => {
        const app = await appAsync;
        request = supertest(app);

        await removeUserWithTestEmail(createUser.email);
        await removeTestPartnership(partnership.description);

        await userRepository.addUser(createUserWithDb);

        await request.post("/api/v1/login")
            .send(loginUser)
            .then(({ body }) => {
                user = body.content;
            });
    });

    describe("POST /api/v1/partnerships", () => {
        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.post("/api/v1/partnerships")
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it("should return new created Partnership", () => {
            return request.post("/api/v1/partnerships")
                .set({ Authorization: user.token })
                .send(partnership)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    partnership = { ...partnership, ...content };
                    expect(content).toHaveProperty("description", partnership.description);
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/partnerships")
                .set({ Authorization: user.token })
                .send({ description: "" })
                .then(({ body: { error } }) => {
                    const [requiredSearchType, requiredSearchFor] = error.errors;
                    expect(requiredSearchType).toHaveProperty("keyword", "required");
                    expect(requiredSearchFor).toHaveProperty("keyword", "required");
                });
        });
    });

    describe("GET /api/v1/partnerships", () => {
        it("should return List of partnerships", () => {
            return request.get("/api/v1/partnerships")
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    const isDefined = content.find(e => e.description === partnership.description);
                    expect(isDefined).toBeDefined();
                });
        });
    });

    describe("GET /api/v1/partnerships/:partnershipId", () => {
        it("should return Partnership by id", () => {
            return request.get(`/api/v1/partnerships/${partnership.partnershipId}`)
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("description", partnership.description);
                });
        });

        it(`should return ${partnershipErrorsLib.partnershipNotFound.message}`, () => {
            const testId = generateId();
            return request.get(`/api/v1/partnerships/${testId}`)
                .set({ Authorization: user.token })
                .expect(partnershipErrorsLib.partnershipNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", partnershipErrorsLib.partnershipNotFound.message);
                });
        });

        it(`should return ${partnershipErrorsLib.partnershipIdIsNotValid.message}`, () => {
            const testId = new ObjectID();
            return request.get(`/api/v1/partnerships/${testId}`)
                .set({ Authorization: user.token })
                .expect(partnershipErrorsLib.partnershipIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", partnershipErrorsLib.partnershipIdIsNotValid.message);
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.get(`/api/v1/partnerships/${partnership.partnershipId}`)

                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

    });

    describe("PATCH /api/v1/partnerships/:partnershipId", () => {

        it(`should return ${partnershipErrorsLib.partnershipIdIsNotValid.message}`, () => {
            return request.patch("/api/v1/partnerships/1")
                .set({ Authorization: user.token })
                .send(updatePartnership)
                .expect(partnershipErrorsLib.partnershipIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", partnershipErrorsLib.partnershipIdIsNotValid.message);
                });
        });

        it(`should return ${partnershipErrorsLib.partnershipNotFound.message}`, () => {
            const testId = generateId();
            return request.patch(`/api/v1/partnerships/${testId}`)
                .set({ Authorization: user.token })
                .send(updatePartnership)
                .expect(partnershipErrorsLib.partnershipNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", partnershipErrorsLib.partnershipNotFound.message);
                });
        });

        it("should return Changes for partnership object not found", () => {
            return request.patch(`/api/v1/partnerships/${partnership.partnershipId}`)
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toEqual({});
                });
        });

        it("should return Phone number is not valid", () => {
            const incorrectUpdatePartnershipData = {
                phoneNumber: "1"
            };
            return request.patch(`/api/v1/partnerships/${partnership.partnershipId}`)
                .set({ Authorization: user.token })
                .send(incorrectUpdatePartnershipData)
                .expect(400)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("errors");
                });
        });

        it("should return An updated partnership", () => {
            return request.patch(`/api/v1/partnerships/${partnership.partnershipId}`)
                .set({ Authorization: user.token })
                .send(updatePartnership)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("description", updatePartnership.description);
                    expect(content).toHaveProperty("updatedAt");
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.patch(`/api/v1/partnerships/${partnership.partnershipId}`)
                .send(updatePartnership)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

    });

    describe("POST /api/v1/partnerships/search", () => {

        it("should return partnership by search object", () => {
            return request.post("/api/v1/partnerships/search")
                .set({ Authorization: user.token })
                .send(searchPartnership)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    const isDefined = content.find(e => e.description === searchPartnership.description);
                    expect(isDefined).toBeDefined();
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/partnerships/search")
                .set({ Authorization: user.token })
                .send({ phoneNumber: "" })
                .then(({ body: { error } }) => {
                    const [pattern] = error.errors;
                    expect(pattern).toHaveProperty("keyword", "pattern");
                });
        });
    });


    describe("DELETE /api/v1/partnerships/:partnershipId", () => {

        it(`should return ${partnershipErrorsLib.partnershipNotFound.message}`, () => {
            const testId = generateId();
            return request.delete(`/api/v1/partnerships/${testId}`)
                .set({ Authorization: user.token })
                .expect(partnershipErrorsLib.partnershipNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", partnershipErrorsLib.partnershipNotFound.message);
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.delete(`/api/v1/partnerships/${partnership.partnershipId}`)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it(`should return ${partnershipErrorsLib.partnershipIdIsNotValid.message}`, () => {
            return request.delete("/api/v1/partnerships/1")
                .set({ Authorization: user.token })
                .expect(partnershipErrorsLib.partnershipIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", partnershipErrorsLib.partnershipIdIsNotValid.message);
                });
        });

    });

});