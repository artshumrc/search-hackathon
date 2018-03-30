var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => res.render('index', {pageName: 'index'}));
router.get('/about', (req, res, next) => res.render('about', {pageName: 'about'}));
router.get('/tutorials', (req, res, next) => res.render('tutorials', {pageName: 'tutorials'}));

module.exports = router;
