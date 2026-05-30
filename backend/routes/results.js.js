const router = require("express").Router();
const pool = require("../db.js.js");

// сохранить результат
router.post("/", async (req, res) => {
    try {
        const { user_id, game, score } = req.body;

        const result = await pool.query(
            "INSERT INTO results (user_id, game, score) VALUES ($1, $2, $3) RETURNING *",
            [user_id, game, score]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Помилка збереження" });
    }
});

// получить результаты пользователя
router.get("/:user_id", async (req, res) => {
    try {
        const results = await pool.query(
            "SELECT * FROM results WHERE user_id=$1",
            [req.params.user_id]
        );

        res.json(results.rows);
    } catch (err) {
        res.status(500).json({ error: "Помилка отримання" });
    }
});

module.exports = router;
