const express = require('express');      
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');  // Import multer
const router = require('./routes/router');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // You can specify the folder to save the uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);  // Rename the file to avoid conflicts
    }
});
const upload = multer({ storage: storage });

app.use('/', router);

const port = 3001;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

