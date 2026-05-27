const jwt = require("jsonwebtoken");

const SECRET = "supersecretkey";

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ error: "Немає токена" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Невірний токен" });
    }
};