//not found

const notFound = (req, res, next) => {
  // const error = new Error ('Not Found : ${req.originalUrl}');
  res.status(404);
  console.log(error);
  res.redirect("/error");
};
//Error Handler

const errorHandler = (err, req, res, next) => {
  const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
  // res.status(statuscode);
  // console.log(error)

  res.redirect("/error");
};
module.exports = { errorHandler, notFound };
