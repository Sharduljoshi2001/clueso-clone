const multer = require('multer');
const path = require('path');
const fs = require('fs');
//ensuring uploads directory exists to avoid crashes
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

//disk storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') //saving files temporarily in 'uploads' folder
    },
    filename: function (req, file, cb) {
        //generating unique filename with timestamp to prevent overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } //50mb limit per file
});

module.exports = upload;