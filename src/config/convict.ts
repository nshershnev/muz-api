import * as dotenv from "dotenv";
import * as convict from "convict";

import { validate, validationRegexLib as rules } from "../utils/validation";

dotenv.config({ path: ".env" });

const environmentSchema: any = {
    type: "object",
    properties: {
        HOST: {
            type: "string",
            pattern: rules.host.source
        },
        PORT: {
            type: "string",
            pattern: rules.port.source
        },
        DB_NAME: { type: "string" },
        MONGODB_URI: {
            type: "string",
            pattern: rules.mongoURI.source
        },
        SESSION_SECRET: { type: "string" },
        ACCESS_TOKEN_EXPIRES_TIME_MINS: {
            type: "string",
            pattern: rules.number.source
        }
    },
    additionalProperties: true,
    required: []
};

const schemaProps = Object.keys(environmentSchema.properties);

const environmentSchemaRequired = {
    ...environmentSchema,
    required: [...schemaProps],
};

class EnvValidation {
    private static config: any;

    private constructor() { }

    private static addConfigVariable(env: string, doc: string) {
        return {
            doc,
            format: "*",
            default: "",
            env
        };
    }

    public static getConfig() {
        if (!EnvValidation.config) {
            try {
                validate(process.env, environmentSchemaRequired);
            }
            catch (err) {
                console.log(err.errors);
                process.exit(1);
            }

            EnvValidation.config = convict({
                host: this.addConfigVariable("HOST", "The IP address to bind."),
                port: this.addConfigVariable("PORT", "The port to bind."),
                expireTime: {
                    accessToken: this.addConfigVariable("ACCESS_TOKEN_EXPIRES_TIME_MINS", "Access token expire time in minutes."),
                },
                keys: {
                    sessionSecret: this.addConfigVariable("SESSION_SECRET", "Session secret key."),
                },
                db: {
                    uri: this.addConfigVariable("MONGODB_URI", "Mongodb URI."),
                    name: this.addConfigVariable("DB_NAME", "Mongodb database name.")
                }
            });
        }
        return EnvValidation.config;
    }
}

export default EnvValidation.getConfig();
