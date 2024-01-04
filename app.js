const createError = require('http-errors');
const dotenv = require('dotenv').config()
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const authMiddleware = require('./middlewares/authMiddleware')
const authRouter= require('./routes/authRoute');
const adminRouter= require('./routes/adminRoute');
const dbConnect = require('./config/dbConnect');
const productRouter =require("./routes/productRoute");
const categoryRouter =require("./routes/categoryRoute");
const cartRouter =require("./routes/cartRoute");

const cors = require('cors')
const sessions = require('express-session')


// const flash = require('connect-flash')
const flash = require('express-flash');
const app = express();
dbConnect()
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// Example configuration in your Express app:
app.set('view engine', 'ejs');

app.use(express.json());
app.use(cors())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(sessions({
  secret: 'your-secret-key', // Use a secure secret key
  resave: false,
  saveUninitialized: true,
}));
app.use((req, res, next) => {
  // Check if req.cookies is defined before accessing its properties
  res.locals.user = req.cookies.refreshToken;
  next();
});

app.use(flash());
app.use('/admin',adminRouter)
app.use('',authRouter);
app.use('/cart',cartRouter)
app.use('/admin/product',productRouter);
app.use('/admin/category',categoryRouter);
// app.use(errorHandler)
// app.use(notFound);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// ... (route definitions for accessOn and accessOff)

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
app.use((req, res, next) => {
  res.set('Cache-control', 'no-store,no-cache')
  next()
})  

module.exports = app;
