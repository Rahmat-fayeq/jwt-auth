const {check} = require('express-validator');
const { signup, getUsers, signin, signout } = require('../controllers/authController');
const verifyJWT = require('../middleware/verifyJWT');
const { handleRefreshToken } = require('../controllers/refreshTokenController');

const router = require('express').Router();

router.post('/signup',[
    check("username","Username is required").isString(),
    check("email","Email is required").isEmail(),
    check("password","Password is required & must be more than 5 characters").isLength({min:6})
],signup);

router.post('/signin',[
    check("email","Email is required").isEmail(),
    check("password","Password is required").isLength({min:6})
],signin);

router.get('/refresh', handleRefreshToken);

router.post('/signout', signout);
router.get('/users',verifyJWT,getUsers)

module.exports = router;