import { ObjectId } from "mongodb";

import { validationRegexLib as rules } from "../../utils/validation";

export interface UserModel {
  _id?: string | ObjectId;
  userId?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  token?: string;
}

export const userSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      pattern: rules.email.source,
      minLength: 9,
      maxLength: 255
    },
    firstName: {
      type: "string",
      pattern: rules.plainString.source
    },
    lastName: {
      type: "string",
      pattern: rules.plainString.source
    },
  },
  required: ["email", "firstName", "lastName"],
  additionalProperties: false
};

export const registerSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      pattern: rules.email.source,
      minLength: 9,
      maxLength: 255
    },
    firstName: {
      type: "string",
      pattern: rules.plainString.source
    },
    lastName: {
      type: "string",
      pattern: rules.plainString.source
    },
    password: {
      type: "string",
      pattern: rules.password.source,
      minLength: 10
    },
  },
  required: ["email", "password"],
  additionalProperties: false
};

export const loginSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      pattern: rules.email.source,
      minLength: 9,
      maxLength: 255
    },
    password: {
      type: "string",
      pattern: rules.password.source,
      minLength: 10
    },
  },
  required: ["email", "password"],
  additionalProperties: false
};