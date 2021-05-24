import * as supertest from "supertest";
import * as bcrypt from "bcrypt-nodejs";
import { ObjectID } from "mongodb";

import { db, generateId } from "../src/utils";
import { appAsync } from "../src/app";
import { LoginUserModel, UserModel, userErrorsLib, userRepository } from "../src/components/user";
import { VacancyModel, vacancyErrorsLib } from "../src/components/vacancy";
import { MONGO_COLLECTIONS } from "../src/shared/constants";

describe("Vacancy", () => {
    let request: any;
    let user: any;

    const createUser: UserModel = {
        email: "vacancy@example.com",
        password: "password",
        firstName: "Edison",
        lastName: "Delaney"
    };

    const currDate = new Date();
    const userId = generateId();

    const createUserWithDb: UserModel = {
        email: "vacancy@example.com",
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

    let vacancy: VacancyModel = {
        description: "We are looking for a good specialist",
        searchType: "Artist search band",
        searchFor: "Electric guitarist looking for a band"
    };

    const updateVacancy = {
        description: "My new personal specialit"
    };

    const searchVacancy = {
        ...updateVacancy,
    };

    const removeUserWithTestEmail = async (email: string) => {
        await db.Context.collection(MONGO_COLLECTIONS.USERS_COLLECTION).deleteOne({ email });
    };

    const removeTestVacancy = async (description: string) => {
        await db.Context.collection(MONGO_COLLECTIONS.VACANCIES_COLLECTION).deleteOne({ description });
    };

    beforeAll(async () => {
        const app = await appAsync;
        request = supertest(app);

        await removeUserWithTestEmail(createUser.email);
        await removeTestVacancy(vacancy.description);

        await userRepository.addUser(createUserWithDb);

        await request.post("/api/v1/login")
            .send(loginUser)
            .then(({ body }) => {
                user = body.content;
            });
    });

    describe("POST /api/v1/vacancies", () => {
        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.post("/api/v1/vacancies")
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it("should return new created Vacancy", () => {
            return request.post("/api/v1/vacancies")
                .set({ Authorization: user.token })
                .send(vacancy)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    vacancy = { ...vacancy, ...content };
                    expect(content).toHaveProperty("description", vacancy.description);
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/vacancies")
                .set({ Authorization: user.token })
                .send({ description: "" })
                .then(({ body: { error } }) => {
                    const [requiredSearchType, requiredSearchFor] = error.errors;
                    expect(requiredSearchType).toHaveProperty("keyword", "required");
                    expect(requiredSearchFor).toHaveProperty("keyword", "required");
                });
        });
    });

    describe("GET /api/v1/vacancies", () => {
        it("should return List of vacancies", () => {
            return request.get("/api/v1/vacancies")
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    const isDefined = content.find(e => e.description === vacancy.description);
                    expect(isDefined).toBeDefined();
                });
        });
    });

    describe("GET /api/v1/vacancies/:vacancyId", () => {
        it("should return Vacancy by id", () => {
            return request.get(`/api/v1/vacancies/${vacancy.vacancyId}`)
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("description", vacancy.description);
                    expect(content).toHaveProperty("city", vacancy.city);
                });
        });

        it(`should return ${vacancyErrorsLib.vacancyNotFound.message}`, () => {
            const testId = generateId();
            return request.get(`/api/v1/vacancies/${testId}`)
                .set({ Authorization: user.token })
                .expect(vacancyErrorsLib.vacancyNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", vacancyErrorsLib.vacancyNotFound.message);
                });
        });

        it(`should return ${vacancyErrorsLib.vacancyIdIsNotValid.message}`, () => {
            const testId = new ObjectID();
            return request.get(`/api/v1/vacancies/${testId}`)
                .set({ Authorization: user.token })
                .expect(vacancyErrorsLib.vacancyIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", vacancyErrorsLib.vacancyIdIsNotValid.message);
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.get(`/api/v1/vacancies/${vacancy.vacancyId}`)

                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

    });

    describe("PATCH /api/v1/vacancies/:vacancyId", () => {

        it(`should return ${vacancyErrorsLib.vacancyIdIsNotValid.message}`, () => {
            return request.patch("/api/v1/vacancies/1")
                .set({ Authorization: user.token })
                .send(updateVacancy)
                .expect(vacancyErrorsLib.vacancyIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", vacancyErrorsLib.vacancyIdIsNotValid.message);
                });
        });

        it(`should return ${vacancyErrorsLib.vacancyNotFound.message}`, () => {
            const testId = generateId();
            return request.patch(`/api/v1/vacancies/${testId}`)
                .set({ Authorization: user.token })
                .send(updateVacancy)
                .expect(vacancyErrorsLib.vacancyNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", vacancyErrorsLib.vacancyNotFound.message);
                });
        });

        it("should return Changes for vacancy object not found", () => {
            return request.patch(`/api/v1/vacancies/${vacancy.vacancyId}`)
                .set({ Authorization: user.token })
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toEqual({});
                });
        });

        it("should return Phone number is not valid", () => {
            const incorrectUpdateVacancyData = {
                phoneNumber: "1"
            };
            return request.patch(`/api/v1/vacancies/${vacancy.vacancyId}`)
                .set({ Authorization: user.token })
                .send(incorrectUpdateVacancyData)
                .expect(400)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("errors");
                });
        });

        it("should return An updated vacancy", () => {
            return request.patch(`/api/v1/vacancies/${vacancy.vacancyId}`)
                .set({ Authorization: user.token })
                .send(updateVacancy)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    expect(content).toHaveProperty("description", updateVacancy.description);
                    expect(content).toHaveProperty("updatedAt");
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.patch(`/api/v1/vacancies/${vacancy.vacancyId}`)
                .send(updateVacancy)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

    });

    describe("POST /api/v1/vacancies/search", () => {

        it("should return Vacancy by search object", () => {
            return request.post("/api/v1/vacancies/search")
                .set({ Authorization: user.token })
                .send(searchVacancy)
                .expect(200)
                .then(({ body }) => {
                    expect(body).toHaveProperty("content");
                    const content = body.content;
                    const isDefined = content.find(e => e.description === searchVacancy.description);
                    expect(isDefined).toBeDefined();
                });
        });

        it("should return Validation error", () => {
            return request.post("/api/v1/vacancies/search")
                .set({ Authorization: user.token })
                .send({ phoneNumber: "" })
                .then(({ body: { error } }) => {
                    const [pattern] = error.errors;
                    expect(pattern).toHaveProperty("keyword", "pattern");
                });
        });
    });


    describe("DELETE /api/v1/vacancies/:vacancyId", () => {

        it(`should return ${vacancyErrorsLib.vacancyNotFound.message}`, () => {
            const testId = generateId();
            return request.delete(`/api/v1/vacancies/${testId}`)
                .set({ Authorization: user.token })
                .expect(vacancyErrorsLib.vacancyNotFound.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", vacancyErrorsLib.vacancyNotFound.message);
                });
        });

        it(`should return ${userErrorsLib.unauthorized.message}`, () => {
            return request.delete(`/api/v1/vacancies/${vacancy.vacancyId}`)
                .expect(userErrorsLib.unauthorized.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", userErrorsLib.unauthorized.message);
                });
        });

        it(`should return ${vacancyErrorsLib.vacancyIdIsNotValid.message}`, () => {
            return request.delete("/api/v1/vacancies/1")
                .set({ Authorization: user.token })
                .expect(vacancyErrorsLib.vacancyIdIsNotValid.status)
                .then(({ body }) => {
                    expect(body).toHaveProperty("error");
                    const error = body.error;
                    expect(error).toHaveProperty("message", vacancyErrorsLib.vacancyIdIsNotValid.message);
                });
        });

    });

});