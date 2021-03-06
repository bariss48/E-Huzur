const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

// rendering signup page
router.get('/signup', (req,res) => {
    res.render('signup');
});
// creating new USER and checking 18 or under if under 18 not signup to app
router.post('/signup', async (req, res) => {
    try{
        if (req.body.age >= 18) {
        const newUser = await User.register(new User({
        age: req.body.age,   
        username: req.body.username,  
        email: req.body.email,  
       }), req.body.password);
       req.flash("success", `Signed you up as ${newUser.username}`);
       req.flash("success", `Uygulamaya Hoşgeldiniz !`);
       }else{
           req.flash("error", `Yaş 18'den küçük olamaz!`);
           res.redirect('/signup');
       }if (req.body.age >= 18) {
        passport.authenticate('local')(req, res, () => {
            res.redirect('/');
           });
       }
    }catch(err){
        console.log(err);
        res.send(err);
    }
 });
 
//login-page
router.get("/login", (req,res) => {
    res.render('login');
});
//authenticate 
router.post("/login", passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
	successFlash: `Girişiniz Başarılı! Hoşgeldiniz !`
})); 
// log-out
router.get("/logout",(req,res) => {
    req.logOut();
    req.flash("success", `Çıkış Başarılı! Görüşmek üzere !`);
    res.redirect('/');
});

module.exports = router;