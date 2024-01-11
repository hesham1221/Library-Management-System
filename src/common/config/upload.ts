import path from 'path';
import multer from 'multer';

const uploadFolder = path.resolve(process.cwd(), 'uploads');

const storageConfig = {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(request, file, callback) {
      const timestamp = new Date().getTime();

      const filename = `${file.originalname}-${timestamp}`;

      callback(null, filename);
    },
  }),
};
export default storageConfig;
