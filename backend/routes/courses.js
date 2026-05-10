const router = require("express").Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// получить курсы
router.get("/", async (req, res) => {
    try {
        const courses = await pool.query("SELECT * FROM courses");
        res.json(courses.rows);
    } catch (err) {
        res.status(500).json({ error: "Помилка сервера" });
    }
});

// записаться на курс
router.post("/enroll", async (req, res) => {
    try {
        const { user_id, course_id } = req.body;

        const result = await pool.query(
            "INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *",
            [user_id, course_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Помилка запису" });
    }
});

module.exports = router;
// получить курсы пользователя
router.get("/my/:user_id", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT courses.* 
             FROM enrollments
             JOIN courses ON enrollments.course_id = courses.id
             WHERE enrollments.user_id = $1`,
            [req.params.user_id]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Помилка отримання курсів" });
    }
});