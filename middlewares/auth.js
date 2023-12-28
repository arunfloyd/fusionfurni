
const redirectIfLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.refreshToken) {
      return res.redirect('/admin/dash');
    }else{
      return res.redirect('/admin/login')
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
    isLogin,
    redirectIfLoggedIn
};