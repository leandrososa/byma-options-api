var express = require('express');
var options = require('../utils/options.js');

var router = express.Router();

/* options funtionality */
router.get('/:underlying', async function(req, res) {
    const underlying = req.params.underlying.toUpperCase();

    if (!/^[A-Z0-9.]+$/.test(underlying)) {
        return res.status(400).json({ error: 'Invalid ticker' });
    }

    const result = await options.getOptions(underlying);
    return res.json(result);
});

module.exports = router;
