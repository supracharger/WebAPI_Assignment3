const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authJwtController = require('./auth_jwt'); // You're not using authController, consider removing it
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies'); // You're not using Movie, consider removing it
const Review = require('./Reviews'); 
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
        // Reviews
        var reviews = false;
        if (req.query.reviews && req.query.reviews === "true")
          reviews = true;
        // Get All
        if (!reviews)
          movies = await Movie.find();    // Get All movies
        // Get All with reviews
        else
          movies = await Movie.aggregate([
            {
                $lookup: {
                  from: "reviews",
                  localField: "_id",
                  foreignField: "movieId",
                  as: "reviews"
            }},
            {
              $addFields: {
                avgRating: {
                  $cond: {
                    if: { $gt: [{$size: "$reviews"}, 0]},
                    then: { $avg: "$reviews.rating"},
                    else: null
                  }
                }
              }
            },
            {
              $sort: {
                avgRating: -1,
                title: 1
              }
            }
          ]);
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
      //
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
      const id = req.params.movieId;
      // Reviews
      var reviews = false;
      if (req.query.reviews && req.query.reviews === "true")
        reviews = true;
      // w/o reviews
      if (!reviews)
        mov = await Movie.findById(id);
      // with reviews
      else
        mov = await Movie.aggregate([
          {
            $match: {_id: new mongoose.Types.ObjectId(id)}
          },
          {
              $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "movieId",
                as: "reviews"
          }},
          {
            $addFields: {
              avgRating: {
                $cond: {
                  if: { $gt: [{$size: "$reviews"}, 0]},
                  then: { $avg: "$reviews.rating"},
                  else: null
                }
              }
            }
          },
          {
            $sort: {
              avgRating: -1,
              title: 1
            }
          }
        ]);
      if (!mov)
        return res.status(404).json({success: false, message: 'Unable to find movie.'});
      mov = JSON.parse(JSON.stringify(mov))
      return res.status(200).json({...mov[0], success: true});
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
      const id = req.params.movieId;
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
      const id = req.params.movieId;
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

    router.route('/reviews')
    .get(authJwtController.isAuthenticated, async (req, res) => {
        const reviews = await Review.find(); // Get All Reviews
        return res.status(200).json(reviews);
    })
    .post(authJwtController.isAuthenticated, async (req, res) => {
      var error = '';
      if (!req.body.movieId)
        error = 'Review needs a movieId!';
      if (!req.body.username)
        error = 'Review needs a username!';
      if (!req.body.review)
        error = 'Review needs review text!';
      if (!req.body.rating)
        error = 'Review needs a rating!';
      //
      if (error!='') {
        console.log(error);
        return res.status(500).json({ success: false, message: error });
      }
      // Check movie exists
      try { mov = await Movie.findById(req.body.movieId); }
      catch { mov = false; }
      if (!mov) {
        console.log('Unable to find movie.');
        return res.status(404).json({success: false, message: 'Unable to find movie.'});
      }
      const rev = new Review({
        movieId: new mongoose.Types.ObjectId(req.body.movieId),
        username: req.body.username,
        review: req.body.review,
        rating: req.body.rating
      });
      try {
        await rev.save();
      } catch (err) {
        console.log(err);
        console.error(err); // Log the error for debugging
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
      }
      return res.status(201).json({ review: rev, success: true, message: "Review created!" });
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