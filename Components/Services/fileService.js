const uuid = require("uuid");
const path = require("path");
const resizer = require('node-image-resizer');
const fs = require("fs");

class FileService {

    async saveFile(file, userId) {
        const setup = {
            all: {
                path: `./images/photos/${userId}/small/`,
                quality: 80
            },
            versions: [{
                quality: 100,
                prefix: 'small_',
                width: 128,
                height: 128
            }]
        };
        try {
            const files = fs.readdirSync(`./images/photos/${userId}/large`);
            if (files.length > 0) {
                fs.unlinkSync(`./images/photos/${userId}/large/${files[0]}`);
                fs.unlinkSync(`./images/photos/${userId}/small/small_${files[0]}`);
            }
            const fileName = uuid.v4() + '.jpg';
            const filePath = path.resolve(`./images/photos/${userId}/large`, fileName);
            await file.mv(filePath);
            await resizer(filePath, setup);
            return fileName;
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports =  new FileService();