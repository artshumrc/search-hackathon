const passageHelper = require('../helpers/passageHelper.js');

const controller = {};

controller.index = (req, res, next) => {
  res.send(JSON.stringify({"version": "0.1"}));
};

controller.loadPassages = (req, res, next) => {
  let { passageTexts, passageParams } = req.body;
  let results = passageHelper.analyze(passageTexts, passageParams);
  res.send(JSON.stringify(results));
};

module.exports = controller;