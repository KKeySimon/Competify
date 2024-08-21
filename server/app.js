const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  // Vite uses port 5173
  origin: ["http://localhost:5173"],
};

// Read up on CORS if you don't know what it is
// Server will only accept requests being sent from front-end
app.use(cors(corsOptions));

const PORT = 3000;

app.use(express.urlencoded({ extended: false }));

const indexRouter = require("./index");
app.use("/api", indexRouter);

app.listen(PORT, () => console.log("Listening in on port " + PORT));
