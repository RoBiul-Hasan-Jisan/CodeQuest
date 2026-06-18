const admin = require("../config/firebase");

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authorization token missing or malformed"
            });
        }

        const token = authHeader.slice(7);

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({
            message: "Invalid or expired Firebase token"
        });
    }
};

module.exports = verifyToken;
