
const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
        req.flash("error","Uygulamaya Giriş Yapmalısın!");
		res.redirect("/login");
	}	
};

module.exports = isLoggedIn;
