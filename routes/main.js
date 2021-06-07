const express = require('express');
const router = express.Router();

router.get("/", (req,res) => {
    res.render('landing', { user: req.user });
    console.log(req.user);
    console.log(req.user.age);
})

module.exports = router;