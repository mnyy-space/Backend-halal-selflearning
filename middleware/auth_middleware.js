const jwt = require('../libs/jwt');


const authMiddleware = (req, res, next) =>{
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token)
    .then(decoded => {
        req.user = decoded;
        next();
    }).catch(err => {
        return res.status(403).json({ error: 'Invalid token' });
    });

}

module.exports = {
    authMiddleware
}


