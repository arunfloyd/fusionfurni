const createError = require("http-errors");
const dotenv = require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const authRouter = require("./routes/authRoute");
const adminRouter = require("./routes/adminRoute");
const dbConnect = require("./config/dbConnect");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/categoryRoute");
const cors = require("cors");
const sessions = require("express-session");
const flash = require("express-flash");
const { v4: uuidv4 } = require('uuid');
const app = express();

dbConnect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  sessions({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);
app.use((req, res, next) => {
  res.locals.user = req.cookies.refreshToken;
  next();
});
app.use(flash());
app.use("", authRouter);
app.use("/admin", adminRouter);
app.use("/admin/product", productRouter);
app.use("/admin/category", categoryRouter);
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});
app.use((req, res, next) => {
  res.set("Cache-control", "no-store,no-cache");
  next();
});
app.listen(process.env.PORT || "3001");
