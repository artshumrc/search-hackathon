const express = require('express');
const router = express.Router();

router.get('/query', function(req, res, next) {
  console.log('search', req.query);
  res.render('search', {query: req.query});
});

module.exports = router;
