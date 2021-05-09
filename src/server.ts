import * as http from "http";
import * as path from "path";
import * as express from "express";
import { Express } from "express";
import swaggerJSDoc = require("swagger-jsdoc");

import { appAsync } from "./app";

// add swagger routes when we run server
appAsync.then((app: Express) => {
  // we may use convict or dotenv instead of using process.env
  const port: number = Number(process.env.PORT) || 8000;
  const host: string = process.env.HOST || "0.0.0.0";

  const swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
        swagger: "2.0",
        info: {
          title: "Muz API",
          version: `1.0.0`,
          description: "API for Muz project",
        },
        host: `${host}:${port}`,
        basePath: `/api/v1`,
        securityDefinitions: {
            Bearer: {
                type: "apiKey",
                in: "header",
                name: "Authorization"
            }
        },
    },
    apis: [`${__dirname}/components/**/*.controller.js`]
  });

  /* Initialize the Swagger middleware */
  app.get("/api-docs", (_req: express.Request, res: express.Response) => res.json(swaggerSpec));
  app.use("/docs", express.static(path.join(__dirname, "public/swagger")));

  /**
   * Create HTTP server.
   */

  const server = http.createServer(app).listen(port, host, () => {
    console.log(`  App is running at http://${host}:${port} `);
    console.log(`  Swagger documentation is available at http://${host}:${port}/docs `);
    console.log("  Press CTRL-C to stop\n");
    server.on("close", async () => await app.get("db").close());
  });
})
.catch((err: Error) => {
  process.exit(1);
});