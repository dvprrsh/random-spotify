import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fastifySensible from "fastify-sensible";
import fastifyStatic from "fastify-static";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "../client/App";

const cssLinksFromAssets = (assets: GenericObject, entryPoint: string) => {
  return assets[entryPoint] ? (assets[entryPoint].css ? assets[entryPoint].css.map((asset: string) => `<link rel="stylesheet" href="${asset}">`).join("") : "") : "";
};

const jsScriptTagsFromAssets = (assets: GenericObject, entryPoint: string, extra = "") => {
  return assets[entryPoint] ? (assets[entryPoint].js ? assets[entryPoint].js.map((asset: string) => `<script src="${asset}"${extra}></script>`).join("") : "") : "";
};

const router: FastifyPluginCallback = (server: FastifyInstance, _opts, done) => {
  server
    .register(fastifyStatic, {
      root: process.env.RAZZLE_PUBLIC_DIR!,
    })
    .register(fastifySensible)
    .get("/", async (req, res) => {
      const assets = await import(process.env.RAZZLE_ASSETS_MANIFEST!);
      const markup = renderToString(
        <StaticRouter location={req.url}>
          <App />
        </StaticRouter>
      );

      res
        .status(200)
        .type("text/html")
        .send(
          `
        <!doctype html>
        <html lang="">
          <head>
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <meta charset="utf-8" />
              <title>Welcome to Razzle</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              ${cssLinksFromAssets(assets.default, "client")}
          </head>
          <body>
              <div id="root">${markup}</div>
              ${jsScriptTagsFromAssets(assets.default, "client", " defer crossorigin")}
          </body>
        </html>
  `
        );
    });
  done();
};

export default router;
