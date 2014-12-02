var express = require('express'),
    path = require('path'),
    passport = require('passport'),
    util = require('util'),
    // url = require('url'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    gcal = require('./GoogleCalendar'),
    configAuth = require('./models/auth'),
    //for local authentication
    mongoose = require('mongoose'),
    flash    = require('connect-flash'),
    morgan       = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    session      = require('express-session'),
    
    // load the auth variables
    this_user = configAuth.this_user,
    google_user = configAuth.google_user,
    venmo_user = configAuth.venmo_user,
    groupme_user = configAuth.groupme_user;

db_url='mongodb://localhost:27017/housemates'
// configuration ===============================================================
mongoose.connect(db_url); // connect to our database

require('./passport')(passport); // pass passport for configuration
    // google_calendar = new gcal.GoogleCalendar(accessToken);


var GOOGLE_CLIENT_ID = configAuth.googleAuth.clientID,
  GOOGLE_CLIENT_SECRET = configAuth.googleAuth.clientSecret,
  GOOGLE_CALLBACK_URL = configAuth.googleAuth.callbackURL;

var calendars = {};

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var users = [];

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ['openid', 'email', 'https://www.googleapis.com/auth/calendar']
  },
  function(accessToken, refreshToken, profile, done) {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    profile.accessToken = accessToken;
    return done(null, profile)
    // process.nextTick(function() {
    //   google_user = {
    //     'name': profile.displayName,
    //     'first_name': profile.name.givenName,
    //     'email': profile.emails[0].value,
    //     'accessToken': accessToken,
    //     'refreshToken': refreshToken,
    //     'picture': profile._json.picture,
    //     'log': 'out'
    //   };
    //   return done(null, profile);
    // });
  }
));

var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views'); // Set the directory for views
  app.set('view engine', 'ejs');  // Set the view engine to EJS
  app.use(express.favicon()); // Return a favicon if requested
  app.use(express.logger('tiny'));  // Log requests to the console.log
  app.use(express.cookieParser());
  app.use(express.bodyParser());  // Parse the request body into req.body object
  app.use(express.methodOverride()); // Allows you to override HTTP methods on old browsers
  app.use(express.session({ secret: 'pineapple' }));

  // required for passport
  // app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

  app.use(app.router); // Do the routes defined below
  app.use(express.static(path.join(__dirname, 'public')));  // Process static files

  app.use(morgan('dev')); // log every request to the console
});

require('./routes.js')(app,passport);



// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
//                                             'https://www.googleapis.com/auth/userinfo.email',
//                                             'https://www.googleapis.com/auth/calendar',
//                                             'https://www.googleapis.com/auth/calendar.readonly'] }),
//   function(req, res){
//     // The request will be redirected to Google for authentication, so this
//     // function will not be called.
//   });

// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/settings' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     // res.redirect('/');
//     res.redirect('/chores'); //<< uncomment this
//     // getCalendarInformation(req, res);
//   });


app.listen(44444);
console.log("Express server listening on port 44444");


function localLogin(username, name, password, req, res){
  res.redirect('/dashboard');
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

function isLoggedIntoGoogle(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/login-google');
}



//------------------------------ CALENDAR FUNCTIONS ------------------------------//

function getCalendarInformation(req, res){
  var accessToken = google_user.accessToken;
  var google_calendar = new gcal.GoogleCalendar(accessToken);
  //Query parameter setup
  var today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23);
  tomorrow.setMinutes(59);
  var cal_items = [];
  google_calendar.calendarList.list(function(err, calendarList) {
    //Use this for just their personal calendar
    cal_items = [{"id": google_user.email}]; //google_user.email}];

    console.log("----Cal Items----: ", cal_items);
    google_calendar.events.list(google_user.email, {'timeMin':today}, function(err, data) {
        console.log("Error: ", err);
        console.log('events');
        console.log(data);
      }
    );
    var freeBusyInfo = google_calendar.freebusy.query({
        'timeMin': today,
        'timeMax': tomorrow,
        'items': cal_items
      },
      {},
      function(err, data){
        // console.log(google_user);
        console.log("Error: ", err);
        console.log("CALENDAR FREEBUSY: ", data);
        //Only accounts for the user's personal calendar
        console.log('Busy Object', data.calendars[google_user.email].busy);
        calendars[google_user.email] = data.calendars[google_user.email].busy;
        console.log(google_user);
        console.log(calendars);
        res.redirect('/settings');
      }
    );


  });
  // res.redirect('/dashboard');// { keep commented out
    // user: google_user.name,
    // name: google_user.first_name,
    // email: google_user.email,
    // picture: google_user.picture });
}


function createEvent(req, res, event_name, start_date, end_date){
  var accessToken = user.accessToken;
  var google_calendar = new gcal.GoogleCalendar(accessToken);
  var new_event = {
    "summary": "RANDOM EVENT",
    "location": "Somewhere",
    "start": {
      "dateTime": start_date,
    },
    "end": {
      "dateTime": end_date,
    }
  };
  google_calendar.events.insert({
    'calendarId': google_user.email},
    new_event)
  .withAuthClient(GoogleStrategy)
          .execute(function(err, result) {
            if(err) next(err);
            else {
              console.log("Result: " + result);
              next(null);
            } 
          });


    // { 
    //         start: {
    //           date: start_date
    //         }, 
    //         end: {
    //           date: end_date
    //         }, 
    //         summary: event_name,
    //         description: "pineapples"
    //       });
          // .withAuthClient(jwt)
          // .execute(function(err, result) {
          //   if(err) next(err);
          //   else {
          //     console.log("Result: " + result);
          //     next(null);
          //   } 
          // });

  console.log("new event: "+new_event.summary);
  return false;
}

//------------------------------ CHORE FUNCTIONS ------------------------------//

function getChores(req, res, user){
 // get all chores
 // if for this_user, add to left side of table
    //get time of event
    //check if time is in google calendar
        //if not: "add to calendar"
        //if yes: "view in calendar"

}