// TODO: implement using application from app server
// it's only if we want implement auto tests
// probably postman tests will be enough

import { appAsync } from "../src/app";
import * as supertest from "supertest";

let request;

describe("GET /random-url", () => {

  beforeAll(async () => {
    // TODO: we may configure init setting in separate file
    const app = await appAsync;
    request = supertest(app);
  });

  it("should return 404", () => {
    return request.get("/random-url")
      .expect(404);
  });

});