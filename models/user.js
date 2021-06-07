const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
     age : {type: Number},
     email : {type: String, required: true, unique: true},
     username: {type: String, required: true, unique: true}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);