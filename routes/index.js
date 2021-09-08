const router = require('express').Router();
const parser = require('../middleware/file-upload');
const Post = require('../models/Post.model');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/create-post', (req, res) => {
  res.render('post-form');
});

router.post('/create-post', parser.single('picture'), (req, res) => {
  const { content } = req.body;
  const picture = req.file.path || null;

  Post.create({
    content,
    creator: req.session.user._id,
    picName: req.file.originalname,
    picPath: picture
  })
    .then((post) => {
      console.log(post);
      res.redirect('/');
    })
    .catch((e) => next(e));
});

module.exports = router;
