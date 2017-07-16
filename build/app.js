"use strict";

// Require
var bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    express = require("express"),
    app = express(),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    flash = require('connect-flash'),
    methodOverride = require("method-override");

// App Config
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })); // To parse the body of a request
app.use(methodOverride('_method'));
app.use(express.static(__dirname));
mongoose.connect(process.env.dbUrl); // Initialize and maintain our db

//mongoose.connect('mongodb://jaks19:royalmari2013@ds161950.mlab.com:61950/studyusa'); // Initialize and maintain our db

// Passport Config (For Authentication)
app.use(require("express-session")({
    secret: "xyz",
    resave: false,
    saveUninitialized: false
}));

// More App Config
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); // Session tracking (Passport sees if user still online)
passport.use(new LocalStrategy(User.authenticate())); //Strategy on how to authenticate. Provided in library passport-local-mongoose
passport.serializeUser(User.serializeUser()); // Provide Hash/unhash method (already written in passport-local-mongoose)
passport.deserializeUser(User.deserializeUser()); // Method for reverse of above (same lib: passport-local-mongoose)

app.use(function (req, res, next) {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Restful Routes
var authRoutes = require('./routes/auth'),
    userRoutes = require('./routes/users'),
    commentsRoutes = require('./routes/comments'),
    addsRoutes = require('./routes/adds'),
    submissionRoutes = require('./routes/submissions'),
    paymentRoutes = require('./routes/payments'),
    messageRoutes = require('./routes/messages'),
    groupRoutes = require('./routes/groups'),
    notifRoutes = require('./routes/notifs'),
    amazons3Routes = require('./routes/amazons3');

app.use(authRoutes), app.use('/index', userRoutes);
app.use('/index/:username/submit/:id/comments', commentsRoutes);
app.use('/index/:username/submit/:id/adds', addsRoutes);
app.use('/index/:username/submit/:id/s3/:subTitle', amazons3Routes);
app.use('/index/:username/submit', submissionRoutes);
app.use('/index/:username/pay', paymentRoutes), app.use('/index/:username/messages', messageRoutes), app.use('/index/:username/groups', groupRoutes), app.use('/index/:username/notifs', notifRoutes);

// Wandering Routes
app.get('/*', function (req, res) {
    res.render('index', { loggedIn: false });
});

// Index
app.get('/', function (req, res) {
    res.render('index', { loggedIn: false });
});

// Server On
app.listen(process.env.PORT, process.env.IP, function () {
    console.log("Portal Activated!");
});
//# sourceMappingURL=app.js.map