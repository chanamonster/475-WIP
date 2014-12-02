// expose our config directly to our application using module.exports
module.exports = {

	'googleAuth' : {
		'clientID' 		: "930999866353-c3hu6lahqhr315traqphsufv83tcnkdc.apps.googleusercontent.com",
		'clientSecret' 	: "ErLCB_385dnn2sdchR679zX-",
		'callbackURL' 	: 'http://localhost:44444/auth/callback'
	},

	'this_user' : {
	  email: "",
	  name: "",
	  first_name: "",
	  last_name: "",
	  picture: "",
	  uid: "",
	  house_id: "",
	  members: []
	},

	'google_user' : {
	  'name': "",
	  'first_name': "",
	  'email': "You are not logged in",
	  'accessToken': "",
	  'refreshToken': "",
	  'picture': "images/no_user.png",
	  'log': "in"
	},

	'venmo_user' : {
	  'name': "",
	  'first_name': "",
	  'email': "You are not logged in",
	  'accessToken': "",
	  'refreshToken': "",
	  'picture': "images/no_user.png",
	  'log': "in"
	},

	'groupme_user' : {
	  'name': "",
	  'first_name': "",
	  'email': "You are not logged in",
	  'accessToken': "",
	  'refreshToken': "",
	  'picture': "images/no_user.png",
	  'log': "in"
	}

};