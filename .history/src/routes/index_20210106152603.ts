import { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import base from "./base";
import quiz from "./quiz";
import emis from "./emis";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/base", base);
routes.use("/quiz", quiz);
routes.use("/emis", emis);

export default routes;