import { Request, Response, NextFunction } from "express";
import * as passport from "passport";
import * as passportLocal from "passport-local";
import * as passportJWT from "passport-jwt";
import * as bcrypt from "bcrypt-nodejs";

import { userErrorsLib, UserModel, userService } from "../components/user";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

export const initStrategies = async (req: Request, res: Response, next: NextFunction) => {
  passport.serializeUser<UserModel, any>((user: UserModel, done: any) => {
    return done(undefined, user.userId);
  });

  passport.deserializeUser(async (userId: string, done: any) => {
    const user: UserModel = await userService.getUserById(userId);
    if (user) {
      return done(undefined, user);
    }
    else {
      return done({ message: userErrorsLib.userNotFound.message });
    }
  });

  const checkUserInDB = async (u: UserModel, done: any, compareSync: any) => {
    const user: any = await userService.getUserByEmail(u.email.toLowerCase());
    if (!user) {
      return done(undefined, false, `Email ${u.email} not found`);
    }
    else {
      if (compareSync(u.password, user.password)) {
        return done(undefined, user);
      }
      else {
        return done(undefined, false, "Invalid email or password");
      }
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" },
    async (email: string, password: string, done: any) => {
      const user: UserModel = { email, password };
      await checkUserInDB(user, done, (a: string, b: string) => bcrypt.compareSync(a, b));
    })
  );

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
    secretOrKey: process.env.SESSION_SECRET
  }, async (user: UserModel, done: any) => {
    await checkUserInDB(user, done, (a: string, b: string) => a === b);
  }));

  const token: string = req.get("authorization");
  if (token) {
    const isValidToken: boolean = await userService.isValidToken(token);
    if (!isValidToken) {
      const response = {
        error: {
          message: userErrorsLib.tokenIsNotValid.message
        }
      };
      return res.status(401).json(response);
    }
  }
  return next();
};

export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (data: any, user: UserModel, err: Error) => {
    if (err === undefined) {
      req.user = user;
      next();
    }
    else {
      const response = {
        error: {
          message: userErrorsLib.unauthorized.message
        }
      };
      return res.status(userErrorsLib.unauthorized.status).json(response);
    }
  })(req, res, next);
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
     next();
  }
  else {
    const response = {
      error: {
        message: userErrorsLib.noAuthenticated.message
      }
    };
    return res.status(userErrorsLib.noAuthenticated.status).json(response);
  }
};