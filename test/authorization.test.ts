import * as supertest from "supertest";

import { db } from "../src/utils";
import { appAsync } from "../src/app";
import { LoginUserModel, UserModel, userErrorsLib } from "../src/components/user";
import { MONGO_COLLECTIONS } from "../src/shared/constants";

describe("Authorization", () => {
	let request: any;

	const removeUsersWithTestEmail = async (email: string) => {
		await db.Context.collection(MONGO_COLLECTIONS.USERS_COLLECTION).deleteOne({ email });
	};

	const user: UserModel = {
		email: "test@example.com",
		password: "password",
		firstName: "Edison",
		lastName: "Delaney"
	};

	const loginUser: LoginUserModel = {
		username: user.email,
		password: user.password
	};

	beforeAll(async () => {
		const app = await appAsync;
		request = supertest(app);

		await removeUsersWithTestEmail(user.email);

		return request.post("/api/v1/users")
			.send(user)
			.then(({ body: { content } }) => {
				expect(content).toHaveProperty("message", `Success! User with ${user.email} was created`);
			});
	});

	describe("POST /api/v1/login", () => {
		it("should return Success! You are logged in", () => {
			return request.post("/api/v1/login")
				.send(loginUser)
				.then(({ body: { content } }) => {
					expect(content).toHaveProperty("token");
				});
		});

		it("should return Validation error", () => {
			return request.post("/api/v1/login")
				.send({
					username: "",
					password: ""
				})
				.then(({ body: { error } }) => {
					const [minLength] = error.errors;

					expect(minLength).toHaveProperty("keyword", "minLength");
					expect(minLength).toHaveProperty("message", "should NOT be shorter than 9 characters");
				});
		});

		it("should return Incorrect username or password", () => {
			return request.post("/api/v1/login")
				.send({
					username: "example@test.com",
					password: "password",
				})
				.then(({ body: { error } }) => {
					expect(error).toHaveProperty("message", userErrorsLib.incorrectUsernameOrPassword.message);
				});
		});
	});

});