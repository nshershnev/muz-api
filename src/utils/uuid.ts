import { v1 as uuid } from "uuid";
import { isUUID } from "validator";

export const generateId = (): string => uuid();

export const isUuidValid = (uuid: string): boolean => isUUID(uuid);