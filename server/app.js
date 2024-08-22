require("dotenv").config();

const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const cors = require("cors");
const corsOptions = {
  // Vite uses port 5173
  origin: ["http://localhost:5173"],
  credentials: true,
};
const passport = require("passport");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const postgreStore = new pgSession({
  pool: require("./model/pool"),
  createTableIfMissing: true,
});

app.use(
  session({
    store: postgreStore,
    secret: process.env.SESSION_SECRET,
    // Turn resave off as login sessions don't frequently change
    resave: false,
    // Recommended to be set to False for login to reduce server storage
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use(express.urlencoded({ extended: false }));
// Read up on CORS if you don't know what it is
// Server will only accept requests being sent from front-end
app.use(cors(corsOptions));

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

const PORT = 3000;
const indexRouter = require("./routes/index");
app.use("/api", indexRouter);

app.listen(PORT, () => console.log("Listening in on port " + PORT));
