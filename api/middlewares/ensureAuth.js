const jwt = require('jsonwebtoken');


module.exports = function(app){
    return function(req, res, next){
        var Secret = app.get('JWT_Key');
        if(!req.headers.authorization){
            return res.json({
                message: 'not loged in'
            })
        }
        var token = req.headers.authorization.replace('Bearer ', '');
        console.log(token);
        jwt.verify(token, Secret, function(error, decoded){
            if(decoded){
                req.user=decoded;
                next();
            } else {
                return res.status(404).json({
                    message: 'not allowed'
                });
            }
        })
    }
}
