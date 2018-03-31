const express = require('express');
const router = express.Router();

router.get('/query', (req, res, next) => {
  console.log('search', req.query);
  res.render('search', {searchTerms: req.query['search  -terms']});
});
router.post('/query', (req, res, next) => {
  console.log('search', req.body);
  var searchTerms = req.body['passage-search-terms'] || req.body['search-terms'];
  res.render('search', {searchTerms: searchTerms});
});

module.exports = router;
