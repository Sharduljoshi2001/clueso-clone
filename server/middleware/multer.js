const multer = require('multer');
//memory storege for video(faster than disk storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage:storage,
    limits:{fileSize:50*1024*1024},
});
module.exports = upload;