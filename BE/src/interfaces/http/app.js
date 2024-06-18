const express = require("express");
const bodyParser = require("body-parser");
const router = require("../../api/routers");

module.exports = async (app) => {
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  // Make sure form data and file submissions are processed
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(__dirname + "/public"));

  router(app);
}
