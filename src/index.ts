import JandaPress from "./JandaPress";
import express from "express";
import { Request, Response, NextFunction } from "express";
import scrapeRoutes from "./router/endpoint";
import { slow, limiter } from "./utils/limit-options";
import { logger } from "./utils/logger";
import { isNumeric } from "./utils/modifier";
import * as pkg from "../package.json";
import dotenv from "dotenv";

const janda = new JandaPress();
const app = express();
app.set("json spaces",2)
dotenv.config();

app.get("/", slow, limiter, (req, res) => {
    let baseUrl = `https://${req.get('host')}`

    res.send({
      success: true,
      date: new Date().toLocaleString(),
      rss: janda.currentProccess().rss,
      heap: janda.currentProccess().heap,
      endpoint: {
        nhentai: {
        get: `${baseUrl}/nhentai/get?book=117013`,
        search: `${baseUrl}/nhentai/search?key=milf&page=1&sort=popular-today`,
        random: `${baseUrl}/nhentai/random`,
        relate: `${baseUrl}/nhentai/relate?book=117013`,
      },
      pururin: {
        get: `${baseUrl}/pururin/get?book=63373`,
        search: `${baseUrl}/pururin/search?key=milf&page=1&sort=most-viewed`,
        random: `${baseUrl}/pururin/random`,
      },
      hentaifox: {
        get: `${baseUrl}/hentaifox/get?book=97527`,
        search: `${baseUrl}/hentaifox/search?key=milf&page=1&sort=latest`,
        random: `${baseUrl}/hentaifox/random`,
      },
      asmhentai: {
        get: `${baseUrl}/asmhentai/get?book=416773`,
        search: `${baseUrl}/asmhentai/search?key=milf&page=1`,
        random: `${baseUrl}/asmhentai/random`,
      },
      hentai2read: {
        get: `${baseUrl}/hentai2read/get?book=butabako_shotaone_matome_fgo_hen/1`,
        search: `${baseUrl}/hentai2read/search?key=milf`,
      },
      threehentai: {
        get: `${baseUrl}/3hentai/get?book=608979`,
        search: `${baseUrl}/3hentai/search?key=milf&page=1&sort=popular-7d`,
        random: `${baseUrl}/3hentai/random`,
      }},
    });
  logger.info({
    path: req.path,
    method: req.method,
    ip: req.ip,
    useragent: req.get("User-Agent")
  });
});

app.use(scrapeRoutes());

app.get("/g/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://nhentai.net/g/${req.params.id}`);
});

app.get("/p/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://pururin.to/gallery/${req.params.id}/re=janda`);
});

app.get("/h/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://hentaifox.com/gallery/${req.params.id}`);
});

app.get("/a/:id", slow, limiter, (req, res) => {
  if (!isNumeric(req.params.id)) throw Error("This path need required number to work");
  res.redirect(301, `https://asmhentai.com/g/${req.params.id}`);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(Error(`The page not found in path ${req.url} and method ${req.method}`));
  logger.error({
    path: req.url,
    method: req.method,
    ip: req.ip,
    useragent: req.get("User-Agent")
  });
});

app.use((error: any, res: Response) => {
  res.status(500).json({
    message: error.message,
    stack: error.stack
  });
});


app.listen(process.env.PORT || 3000, () => console.log(`${pkg.name} is running on port ${process.env.PORT || 3000}`));
