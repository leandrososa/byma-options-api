var express = require('express');
var options = require('../utils/options.js')

var router = express.Router();

/* options funtionality */
router.get('/:underlying', async function(req, res, next) {
    const getOptions = await options.getOptions(req.params.underlying);
    res.send(getOptions);
});

module.exports = router;
