const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).send({ message: "A token is required for authentication" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({ message: "Invalid Token" });
    }
    return next();
};

const isHostOrCoHost = (req, res, next) => {
    if (req.user && (req.user.role === 'host' || req.user.role === 'co-host')) {
        next();
    } else {
        res.status(403).send({ message: "Requires Host or Co-host Role" });
    }
}


module.exports = { verifyToken, isHostOrCoHost };
