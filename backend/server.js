const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/results", require("./routes/results"));

app.listen(5000, () => {
    console.log("Server started on port 5000");
});