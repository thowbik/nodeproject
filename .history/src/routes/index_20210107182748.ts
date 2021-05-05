import { Router, Request, Response } from "express";
import base from "./base";

const routes = Router();

routes.use("/base", base);

export default routes;