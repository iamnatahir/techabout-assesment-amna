const multer = require("multer");
const path = require("path");

// Store uploaded files in uploads folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }
});

// Allow only pdf, zip, docx
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        ".pdf",
        ".zip",
        ".docx"
    ];

    const extension = path.extname(file.originalname);

    if (allowedTypes.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF, ZIP and DOCX files are allowed"));
    }

};

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024

    }

});

module.exports = upload;