const express = require('express');
const router = express.Router();

// Example route
router.get('/profile', (req, res) => {
    res.send('Profile route working!');
});

module.exports = router;
