import { ObjectId } from "mongodb";

import { validationRegexLib as rules } from "../../utils/validation";

export interface UserModel {
  _id?: string | ObjectId;
  userId?: string;
  email?: string;
  phoneNumber?: string;
  cardNumber?: string;
  instrument?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
    phoneNumber: {
      type: "string",
      pattern: rules.phoneNumber.source,
    },
    instrument: {
      type: "string"
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

export const restoreUserSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      pattern: rules.email.source,
      minLength: 9,
      maxLength: 255
    },
  },
  required: ["email"],
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
    phoneNumber: {
      type: "string",
      pattern: rules.phoneNumber.source,
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
      type: "string"
    },
  },
  anyOf: [
    { required: ["email"] },
    { required: ["phoneNumber"]}
  ],
  allOf: [
    { required: ["firstName"] },
    { required: ["lastName"] },
    { required: ["password"] }
  ],
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
      type: "string"
    },
  },
  required: ["email", "password"],
  additionalProperties: false
};