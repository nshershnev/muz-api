/**
 * Module dependencies.
 */
import { Express } from "express";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as cors from "cors";
import * as errorHandler from "errorhandler";
import * as express from "express";
import expressValidator = require("express-validator");
import * as passport from "passport";
import * as mongo from "connect-mongo";
import * as session from "express-session";

import {
  eventController,
  partnerController,
  partnershipController,
  vacancyController,
  userController
} from "./components";

import { db, handleSyntaxErrorMiddleware, logger } from "./utils";
import * as passportConfig from "./config/passport";
import config from "./config/convict";

const MongoStore = mongo(session);

export const appAsync = Promise.all(
  [
    // we may initialize here async functions
    // before our application will be started
    db.connect()
  ]
).then(async (): Promise<Express> => {
  /**
   * Create Express server.
   */
  const app = express();

  process.setMaxListeners(24);

  // it just to have db instance in tests when we are using app as init instance
  app.set("db", db);

  /**
   * Express configuration.
   */
  app.use(compression());
  app.use(bodyParser.json());
  app.use(handleSyntaxErrorMiddleware);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(expressValidator());
  app.use(passportConfig.initStrategies);
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.get("keys.sessionSecret"),
    store: new MongoStore({
      url: config.get("db.uri"),
      autoReconnect: true
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  /**
   * Headers for response to React application
   * We may set up it with deployment
   */
  const corsOptions: cors.CorsOptions = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: [
      "http://localhost:3000",
      "http://0.0.0.0:3000",
    ],
    preflightContinue: false
  };
  app.use(cors(corsOptions));

  // here we may connect all  controllers for needed version of back end
  app.use(
    "/api/v1",
    eventController,
    partnerController,
    partnershipController,
    vacancyController,
    userController,
  );

  /**
   * Error Handler. Provides full stack - remove for production
   */
  app.use(errorHandler());

  return app;
});