const router = require("express").Router();
const pool = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "supersecretkey";

// ================= РЕГИСТРАЦИЯ =================

router.post("/register", async (req, res) => {
    try {
        const { login, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await pool.query(
            "INSERT INTO users (login, password) VALUES ($1, $2) RETURNING id, login",
            [login, hashedPassword]
        );

        res.json(user.rows[0]);

    } catch (err) {
        res.status(500).json({ error: "Помилка" });
    }
});

// ================= ВХОД =================

router.post("/login", async (req, res) => {
    try {
        const { login, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE login=$1",
            [login]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Невірний логін" });
        }

        const valid = await bcrypt.compare(password, user.rows[0].password);

        if (!valid) {
            return res.status(401).json({ error: "Невірний пароль" });
        }

        // 🔥 создаём токен
        const token = jwt.sign(
            { id: user.rows[0].id, login: user.rows[0].login },
            SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token: token,
            user: {
                id: user.rows[0].id,
                login: user.rows[0].login
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Помилка" });
    }
});

module.exports = router;