const jwt = require('jsonwebtoken');
const Token = require('../models/tokenModal');

const handleRefreshToken = async(req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies?.jwt) return res.sendStatus(401);
        const refreshToken = cookies.jwt;
        const token = await Token.findOne({refreshToken});
        if(!token) return res.sendStatus(403);

        // evaluate jwt
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                console.log('decoded'+decoded.user.id);
                if(err || token.user_id.toString() !== decoded.user.id) return res.sendStatus(403);

                const accessToken = jwt.sign({
                    user:{
                        id:decoded.user._id,
                        username:decoded.user.username,
                        email: decoded.user.email
                     }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: "10s"
                    }
                );
                res.json({accessToken});
            }
        );

    } catch (error) {
        console.log(error)
        res.status(500).json({errors:[{"msg":"Internal Server Error"}]});
    }
}


module.exports = {handleRefreshToken};