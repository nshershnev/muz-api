# Muz-api

Key technologies: 
[node](https://nodejs.org/en/),
[npm](https://www.npmjs.com),
[express](http://expressjs.com),
[typescript](https://www.typescriptlang.org/),
[jest](https://facebook.github.io/jest/),
[supertest](https://www.npmjs.com/package/supertest-as-promised),
[swagger](https://swagger.io)

## Features

- Fully automated toolchain with npm run scripts
- Typescript
- Node ^8
- Jest + Supertest
- Passport
- Swagger
- TypeDoc
- MongoDB

## Quickstart

```bash
npm install
npm  start     # Builds and runs nodemon or npm run build && node dist/server.js
```

**WARNING: the folder /dist is intended for build files only. Any files manually placed in these will be deleted permanently by the project scripts**

### Code Quality
To ensure code quality testing and linting are included in this project.
Testing is handled by [Jest](https://facebook.github.io/jest/) and [Supertest](https://www.npmjs.com/package/supertest-as-promised)

[TSLint](https://palantir.github.io/tslint/) is used for linting.

To start the QA scripts run the following:
```bash
# run tests
npm run test
```
To review documentation and test existing endpoints run server:

```bash
# start server
npm run start
```

and open `http://0.0.0.0:8000/docs`.

Note: You may configure `PORT` and `HOST` for server using env variables.