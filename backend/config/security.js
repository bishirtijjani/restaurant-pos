const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const express = require("express");

const setupSecurity = (app) => {
  // enable trust proxy first
  app.set("trust proxy", 1);

  // Helmet
  app.use(helmet());

  // Disable X-Powered-By
  app.disable("x-powered-by");

  // HTTPS Redirect (Production only)
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (!req.secure && req.get("x-forwarded-proto") !== "https") {
        return res.redirect("https://" + req.get("host") + req.url);
      }
      next();
    });
  }

  // Data Sanitization
  app.use(mongoSanitize());
  app.use(xss());

  // JSON Body Parser with 50mb limit
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
};

module.exports = setupSecurity;
