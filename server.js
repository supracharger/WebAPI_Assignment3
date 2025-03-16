const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authJwtController = require('./auth_jwt'); // You're not using authController, consider removing it
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies'); // You're not using Movie, consider removing it
const { default: mongoose } = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

const router = express.Router();

// Removed getJSONObjectForMovieRequirement as it's not used

router.post('/signup', async (req, res) => { // Use async/await
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' }); // 400 Bad Request
  }

  try {
    const user = new User({ // Create user directly with the data
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
    });

    await user.save(); // Use await with user.save()

    res.status(201).json({ success: true, msg: 'Successfully created new user.' }); // 201 Created
  } catch (err) {
    if (err.code === 11000) { // Strict equality check (===)
      return res.status(409).json({ success: false, message: 'A user with that username already exists.' }); // 409 Conflict
    } else {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
    }
  }
});


router.post('/signin', async (req, res) => { // Use async/await
  try {
    const user = await User.findOne({ username: req.body.username }).select('name username password');

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' }); // 401 Unauthorized
    }

    const isMatch = await user.comparePassword(req.body.password); // Use await

    if (isMatch) {
      const userToken = { id: user._id, username: user.username }; // Use user._id (standard Mongoose)
      const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' }); // Add expiry to the token (e.g., 1 hour)
      res.status(200).json({ success: true, token: 'JWT ' + token });
    } else {
      res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' }); // 401 Unauthorized
    }
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
  }
});

router.route('/movies')
    .get(authJwtController.isAuthenticated, async (req, res) => {
        const movies = await Movie.find();
        return res.status(200).json(movies);
    })
    .post(authJwtController.isAuthenticated, async (req, res) => {
      var error = '';
      if (!req.body.title)
        error = 'Movie needs a title!';
      if (!req.body.releaseDate)
        error = 'Movie needs a releaseDate!';
      if (!req.body.genre)
        error = 'Movie needs a genre!';
      if (!req.body.actors)
        error = 'Movie needs actors!';
      if (error!='')
        return res.status(500).json({ success: false, message: error });
      const mov = new Movie({
        title: req.body.title,
        releaseDate: req.body.releaseDate,
        genre: req.body.genre,
        actors: req.body.actors
      });
      try {
        await mov.save();
      } catch (err) {
        if (err.code === 11000) { // Strict equality check (===)
          return res.status(409).json({ success: false, message: 'A movie with that name already exists.' }); // 409 Conflict
        } else {
          console.error(err); // Log the error for debugging
          return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
        }
      }
      return res.status(201).json({ movie: mov, success: true });
    })
    .all((req, res) => {
      // Any other HTTP Method
      // Returns a message stating that the HTTP method is unsupported.
      res.status(405).send({ message: 'HTTP method not supported.' });
    });

router.route('/movies/:movieId')
    .get(authJwtController.isAuthenticated, async (req, res) => {
      const id = req.params.movieId
      try {
        const mov = await Movie.findById(id);
      } catch {
        mov = false;
      }
      if (!mov)
        return res.status(404).json({success: false, message: 'Unable to find movie.'});
      return res.status(200).json({movie: mov, success: true});
    })
    .put(authJwtController.isAuthenticated, async (req, res) => {
      var obj = {};
      if (req.body.title)
        obj['title'] = req.body.title;
      if (req.body.releaseDate)
        obj['releaseDate'] = req.body.releaseDate;
      if (req.body.genre)
        obj['genre'] = req.body.genre;
      if (req.body.actors)
        obj['actors'] = req.body.actors;
      const id = req.params.movieId
      try {
        var rp = await Movie.findByIdAndUpdate(id, obj);
      } catch {
        rp = false;
      }
      if (!rp)
        return res.status(404).json({success: false, message: 'Unable to Update movie.'});
      return res.status(200).json({success: true, message: 'Updated Movie.'});
    })
    .delete(authJwtController.isAuthenticated, async (req, res) => {
      const id = req.params.movieId
      try {
        var rp = await Movie.findByIdAndDelete(id);
      } catch {
        rp = false;
      }
      if (!rp)
        return res.status(404).json({success: false, message: 'Unable to Delete movie.'});
      return res.status(200).json({success: true, message: 'Deleted Movie.'});
    })
    .all((req, res) => {
      // Any other HTTP Method
      // Returns a message stating that the HTTP method is unsupported.
      res.status(405).send({ message: 'HTTP method not supported.' });
    });

app.use('/', router);

const PORT = process.env.PORT || 8080; // Define PORT before using it
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // for testing only