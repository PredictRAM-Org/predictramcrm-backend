const express = require("express");

const modulesSample = require("../../modules.sample");

const router = express.Router();

modulesSample.forEach((module) => {
  router.use(module.path, module.routes);
});

router.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;
