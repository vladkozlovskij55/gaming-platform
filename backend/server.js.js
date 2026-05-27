const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth.js"));
app.use("/courses", require("./routes/courses.js"));
app.use("/results", require("./routes/results.js"));

app.listen(5000, () => {
    console.log("Server started on port 5000");
});