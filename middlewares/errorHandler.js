const notFound = (req, res, next) => {
  res.status(404);
  console.log(error);
  res.redirect("/error");
};

const errorHandler = (err, req, res, next) => {
  const statuscode = res.statusCode == 200 ? 500 : res.statusCode;

  res.redirect("/error");
};
module.exports = { errorHandler, notFound };
