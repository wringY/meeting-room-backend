import * as multer from 'multer'
import * as fs from 'fs'

export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
       try {
            fs.mkdirSync('uploads')
       } catch (error) {
       }
       cb(null, 'uploads')
    },
    filename(req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname
        callback(null, uniqueSuffix)
    },
})