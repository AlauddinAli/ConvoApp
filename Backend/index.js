const express = require("express");
const cors = require('cors');
const multer = require("multer");
const docxToPDF = require("docx-pdf");
const path = require("path");

const app = express();

// Use CORS middleware right after initializing the app
// More specific CORS configuration
const corsOptions = {
  origin: "https://convoapp-frontend.onrender.com",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Setting up the file storage
// NOTE: Render's free instances have an ephemeral file system.
// This means the 'uploads' and 'files' folders will be cleared when the server sleeps or restarts.
// This is okay for a quick convert-and-download process, but not for permanent storage.
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

// <-- MAJOR CHANGE HERE
// This code uses the port Render provides, or defaults to 3000 for local development.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});