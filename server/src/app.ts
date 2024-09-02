require("dotenv").config();

import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
const pgSession = require("connect-pg-simple")(session);
import cors from "cors";
const corsOptions = {
  // Vite uses port 5173
  origin: ["http://localhost:5173"],
  credentials: true,
};
import passport from "passport";

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
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "strict",
      /* This strict was added from here. Look here for potential source of bugs if needed
        https://stackoverflow.com/questions/61999068/how-do-i-use-cookies-in-express-session-connect-sid-will-soon-be-rejected */
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

const PORT = 3000;
const indexRouter = require("./routes/index");
app.use("/api", indexRouter);

// We use any for err as any request could throw any error in the application
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send(err);
});

app.listen(PORT, () => console.log("Listening in on port " + PORT));
