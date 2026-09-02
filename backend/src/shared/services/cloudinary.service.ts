import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { logger } from '../utils/logger';

let apiKey = process.env.CLOUDINARY_API_KEY || '471791397595125';
let apiSecret = process.env.CLOUDINARY_API_SECRET || 'VrR34GskHuyz4T52PDefZt7h4aQ';
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'zryscktr';

// Auto-correct if user accidentally swapped numeric API Key and alphanumeric API Secret
if (/^\d+$/.test(apiSecret) && !/^\d+$/.test(apiKey)) {
  const temp = apiKey;
  apiKey = apiSecret;
  apiSecret = temp;
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder = 'protego_uploads',
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload stream error:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload returned an empty response'));
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export { cloudinary };
