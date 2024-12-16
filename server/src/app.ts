require("dotenv").config();

import express from "express";
import session from "express-session";
const pgSession = require("connect-pg-simple")(session);
import cors from "cors";
const corsOptions = {
  // Vite uses port 5173
  origin: ["http://localhost:5173", "https://competify.vercel.app"],
  credentials: true,
};
import passport from "passport";
import pool from "./model/pool";
import { startCronJob } from "./util/minute_cron";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const postgreStore = new pgSession({
  pool: pool,
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
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "none",
      secure: false,
    },
  })
);

app.use(express.urlencoded({ extended: false }));
// Read up on CORS if you don't know what it is
// Server will only accept requests being sent from front-end
app.use(cors(corsOptions));

require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

const PORT = parseInt(process.env.PORT || "3000", 10);
const indexRouter = require("./routes/index");
app.use("/api", indexRouter);

// We use any for err as any request could throw any error in the application
app.use((err: any, req, res, next) => {
  console.error(err);
  res.status(500).send(err);
});

startCronJob();

app.listen(PORT, "0.0.0.0", () => console.log("Listening in on port " + PORT));
