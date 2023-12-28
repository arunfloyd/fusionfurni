const isLogin = async(req, res, next) => {
    try {
        if (!req.session.user_id) {
            return res.redirect('/admin/login');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};

const redirectIfLoggedIn = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      return res.redirect('/admin/dash');
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