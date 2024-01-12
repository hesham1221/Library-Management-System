import path from 'path';
import multer from 'multer';

const uploadFolder = path.resolve(process.cwd(), 'uploads');

const storageConfig = {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(request, file, callback) {
      const timestamp = new Date().getTime();
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${file.originalname.split('.')[0]}-${timestamp}${ext}`;

      callback(null, filename);
    },
  }),
};
export default storageConfig;
