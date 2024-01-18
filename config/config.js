const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../public/productImage"));
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }); 
const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    req.fileValidationError = "Only file images are allowed..!!"
    return cb(new Error("Only file images are allowed..!!"), false)
  }
  cb(null, true)
}
const upload = multer({ storage: storage, imageFilter: imageFilter })

module.exports = {
  upload
}

