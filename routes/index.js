const router = require('express').Router();
const parser = require('../middleware/file-upload');
const Post = require('../models/Post.model');

const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

/* GET home page */
router.get('/', (req, res, next) => {
  Post.find()
    .then((posts) => res.render('index', { posts }))
    .catch((e) => next(e));
});

router.get('/create-post', (req, res) => {
  res.render('post-form');
});

router.get('/posts/:id', (req, res) => {
  const { id } = req.params;
  Post.findById(id)
    .populate('creator')
    .populate({
      path: 'comments',
      populate: { path: 'authorId' }
    })
    .then((post) => {
      console.log(post);
      res.render('post-detail', { post });
    })
    .catch((e) => next(e));
});

router.post(
  '/create-post',
  isLoggedIn,
  parser.single('picture'),
  (req, res) => {
    const { content } = req.body;
    const picture = req.file.path || null;
    const user = req.session.user._id;

    Post.create({
      content,
      creator: user,
      picName: req.file.originalname,
      picPath: picture
    })
      .then((post) => {
        res.redirect('/');
      })
      .catch((e) => next(e));
  }
);

router.post(
  '/comment',
  isLoggedIn,
  parser.single('picture'),
  (req, res, next) => {
    const { id, content } = req.body;
    let imagePath, imageName;

    if (req.file) {
      imagePath = req.file.path;
      imageName = req.file.originalname;
    }

    Post.findById(id)
      .then((post) => {
        const comment = {
          content,
          authorId: post.creator,
          imagePath,
          imageName
        };
        post.comments.push(comment);
        return post.save();
      })
      .then(() => {
        res.redirect(`/posts/${id}`);
      })
      .catch((e) => next(e));
  }
);

module.exports = router;
