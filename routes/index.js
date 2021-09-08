const router = require('express').Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/create-post', (req, res) => {
  res.render('post-form');
});

router.post('/create-post', (req, res) => {});

module.exports = router;
