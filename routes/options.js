var express = require('express');
var options = require('../utils/options.js')

var router = express.Router();

/* options funtionality */
router.get('/api/:underlying', function(req, res, next) {
    const getOptions = options.getOptions(req.params.categoryId);
    res.json(getOptions);
    //res.render('index', { title: 'Express' });
});

module.exports = router;
