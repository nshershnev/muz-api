import * as Ajv from "ajv";
import { cloneDeep, isArray } from "lodash";

const ajv = new Ajv({allErrors: true});
require("ajv-keywords")(ajv, ["formatMinimum", "formatMaximum"]);

export interface ValidationRegexLib {
    [field: string]: RegExp;
}

export const validationRegexLib: ValidationRegexLib = {
    number: /^[0-9]+$/,
    email: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    phoneNumber: /(\(?([\d \-\)\–\+\/\(]+){9,}\)?([ .\-–\/]?)([\d]+))/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@£$%^&*()_+\-**])[a-zA-Z0-9!@£$%^&*()_+\-**]{10,}$/,
    plainString: /^[-.'\sA-Za-z\u00C0-\u017F]*$/i,
    mongoURI: /^(mongodb:(?:\/{2})?)((\w+?):(\w+?)@|:?@?)(\w+?):(\d+)\/(\w+?)/,
    host: /^(((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})|(localhost))$/,
    port: /^[1-9][0-9]{0,4}$/
};

export function validate(content: any, schema: any, isUpdate: boolean = false) {
    const data = cloneDeep(content);
    const objectSchema = cloneDeep(schema);

    // trim and execute format functions
    trim(data);
    execFormats(objectSchema, isUpdate);

    // validate content
    ajv.validate(objectSchema, data);

    if (ajv.errors) {
        const valErr: Error = new Error();
        valErr.errors = ajv.errors;
        valErr.status = 400;
        throw valErr;
    }

    if (isUpdate) {
        convertForUpdate(data);
    }

    return data;
}

function execFormats(object: any, isUpdate: boolean) {
    if ("properties" in object) {
        if (isUpdate && "required" in object) {
            delete object.required;
        }
        for (const prop in object.properties) {
            if (typeof object.properties[prop] === "object") {
                if ("properties" in object.properties[prop]) {
                    execFormats(object.properties[prop], isUpdate);
                }
                else if ("items" in object.properties[prop]) {
                    execFormats(object.properties[prop].items, isUpdate);
                }
                else {
                    for (const format of ["formatMaximum", "formatMinimum", "maximum", "minimum"]) {
                        if (format in object.properties[prop]
                            && typeof object.properties[prop][format] === "function") {
                            object.properties[prop][format] = object.properties[prop][format]();
                        }
                    }
                }
            }
        }
    }
}

function trim(value: any) {
    if (typeof value === "object") {
        for (const prop in value) {
            if (typeof value[prop] === "string") {
                value[prop] = value[prop].trim();
            }
            else if (value[prop] !== null) {
                trim(value[prop]);
            }
        }
    }
}

export function convertForUpdate(data: any) {
    if (typeof data === "object") {
        const deepUpdateFields = (prefix: string, value: any) => {
            if (typeof value === "object" && !isArray(value) && value !== null ) {
                for (const prop in value) {
                    deepUpdateFields(prefix ? `${prefix}.${prop}` : prop, value[prop]);
                    if (typeof value[prop] === "object" && !isArray(value[prop])) {
                        delete value[prop];
                    }
                }
            }
            else {
                data[prefix] = value;
            }
        };
        deepUpdateFields("", data);
    }
}