const multer = require('multer');
const path = require('path');
function configureMulter() {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/productImage'));
        },
        filename: (req, file, cb) => {
            cb(null,file.originalname);
        }
    });
}
module.exports = {
    configureMulter,
}