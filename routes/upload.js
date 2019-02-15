let express = require('express');
const fs = require("fs");
let router = express.Router();
let formidable = require('formidable');
let path = require('path');

/* GET home page. */
router.post('/upload.html', (req, res, next) => {
        let form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files)=>{
            const [fileName, fileExt] = files.upload.name.split('.');
            if (fileExt === "mp3"){
                fs.readFile(files.upload.path, (err, data) => {
                    let newPath = path.join(__dirname, "../public/music", fileName + fileExt);
                    fs.writeFile(newPath, data, (err) => {
                        console.log("Finished writing file..." + err);
                    });
                });
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({ error: "Uploaded file is not mp3" }, null, 3));
            }
        });
    });

module.exports = router;