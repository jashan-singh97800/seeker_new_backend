import { S3Client } from '@aws-sdk/client-s3';
import { BadRequestException } from '@nestjs/common';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

export const s3Config = {
    s3: new S3Client({
        region: process.env.REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY || '',
            secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY || '',
        },
    }),
    bucket: process.env.AWS_S3_BUCKET_NAME || '',
    imageKitUrl: process.env.IMAGE_KIT_URL || '',
};

export const multerS3Config = {
    storage: multerS3({
        s3: s3Config.s3,
        bucket: s3Config.bucket,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const uniqueName = `resumes/${uuidv4()}${extname(file.originalname)}`;
            cb(null, uniqueName);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new BadRequestException('Only PDF files are allowed'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
};
