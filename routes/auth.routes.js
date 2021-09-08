const router = require('express').Router();
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ℹ️ Handles password encryption
const bcryptjs = require('bcryptjs');

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require('../models/User.model');

// require (import) middleware functions
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary
});

const parser = multer({ storage: storage });

////////////////////////////////////////////////////////////////////////
///////////////////////////// SIGNUP //////////////////////////////////
////////////////////////////////////////////////////////////////////////

// .get() route ==> to display the signup form to users
router.get('/signup', isLoggedOut, (req, res) => res.render('auth/signup'));

// .post() route ==> to process form data
router.post(
  '/signup',
  isLoggedOut,
  parser.single('picture'),
  (req, res, next) => {
    const { username, email, password } = req.body;
    const picture = req.file.path;

    if (!username || !email || !password) {
      res.render('auth/signup', {
        errorMessage:
          'All fields are mandatory. Please provide your username, email and password.'
      });
      return;
    }

    // make sure passwords are strong:
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
      res.status(500).render('auth/signup', {
        errorMessage:
          'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'
      });
      return;
    }

    bcryptjs
      .genSalt(saltRounds)
      .then((salt) => bcryptjs.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          username,
          email,
          picture,
          passwordHash: hashedPassword
        });
      })
      .then((userFromDB) => {
        console.log('Newly created user is: ', userFromDB);
        res.redirect('/user-profile');
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          res
            .status(500)
            .render('auth/signup', { errorMessage: error.message });
        } else if (error.code === 11000) {
          res.status(500).render('auth/signup', {
            errorMessage:
              'Username and email need to be unique. Either username or email is already used.'
          });
        } else {
          next(error);
        }
      }); // close .catch()
  }
);

////////////////////////////////////////////////////////////////////////
///////////////////////////// LOGIN ////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// .get() route ==> to display the login form to users
router.get('/login', isLoggedOut, (req, res) => res.render('auth/login'));

// .post() login route ==> to process form data
router.post('/login', isLoggedOut, (req, res, next) => {
  const { email, password } = req.body;

  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.render('auth/login', {
          errorMessage: 'Email is not registered. Try with other email.'
        });
        return;
      } else if (bcryptjs.compareSync(password, user.passwordHash)) {
        req.session.user = user;
        console.log('hi');
        res.redirect('/user-profile');
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch((error) => next(error));
});

////////////////////////////////////////////////////////////////////////
///////////////////////////// LOGOUT ////////////////////////////////////
////////////////////////////////////////////////////////////////////////

router.post('/logout', isLoggedIn, (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/user-profile', isLoggedIn, (req, res) => {
  res.render('users/user-profile');
});

module.exports = router;
