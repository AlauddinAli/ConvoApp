const fs = require("fs");
const express = require("express");
const cors = require('cors');
const multer = require("multer");
const docxToPDF = require("docx-pdf");
const path = require("path");

// Create 'uploads' and 'files' directories if they don't exist
const uploadDir = 'uploads';
const filesDir = 'files';

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(filesDir)){
    fs.mkdirSync(filesDir);
}
const app = express();

// More specific CORS configuration
const corsOptions = {
  origin: "https://convoapp-frontend.onrender.com",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Setting up the file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.post("/convertFile", upload.single("file"), (req, res, next) => {
    try {
        // <-- I ADDED THESE TWO LINES FOR DEBUGGING -->
        console.log("--- NEW FILE UPLOAD REQUEST RECEIVED ---");
        console.log(req.file);
        // <-- END OF ADDED LINES -->

        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }
        // Defining output file path
        let outoutPath = path.join(
            __dirname,
            "files",
            `${req.file.originalname}.pdf`
        );
        docxToPDF(req.file.path, outoutPath, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }
            res.download(outoutPath, () => {
                console.log("file downloaded");
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// This code uses the port Render provides, or defaults to 3000 for local development.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});