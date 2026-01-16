import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class S3UploadService {
    private s3Client: S3Client;
    private bucket: string;
    private imageKitUrl: string;

    constructor() {
        const config = {
            region: process.env.REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY || '',
                secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY || '',
            },
        };

        this.s3Client = new S3Client(config);
        this.bucket = process.env.AWS_S3_BUCKET_NAME || '';
        this.imageKitUrl = process.env.IMAGE_KIT_URL || '';
    }

    async uploadFile(file: any, options: { folder: string; maxSize?: number; acl?: string }): Promise<{ url: string; s3Url: string; key: string }> {
        const { folder } = options;

        const key = `${folder}/${uuidv4()}${extname(file.originalname)}`;

        const commandParams = {
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: options.acl as any || 'public-read',
        };

        const command = new PutObjectCommand(commandParams);

        try {
            const result = await this.s3Client.send(command);

            console.log('S3 Upload Result>>>>>>>>>:', result);
        } catch (error) {
            console.error('S3 Upload Error:', error.message);
            throw error;
        }

        const s3Url = `https://${this.bucket}.s3.${process.env.REGION || 'us-east-1'}.amazonaws.com/${key}`;
        let url = s3Url;

        console.log('Generated S3 URL:', s3Url);
        if (this.imageKitUrl) {
            let baseUrl = this.imageKitUrl;
            if (!baseUrl.startsWith('http')) {
                baseUrl = `https://${baseUrl}`;
            }
            baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            url = `${baseUrl}/${key}`;
            console.log('Generated ImageKit/CloudFront URL:', url);
        }

        return { url, s3Url, key };
    }

    async deleteFile(key: string): Promise<void> {
        if (!key) return;

        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
        } catch (error) {
            console.error('Failed to delete file from S3:', error);
            // Don't throw to avoid blocking the main flow
        }
    }

    validateResumeFile(file: any): void {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException('Only PDF files are allowed');
        }
    }
}
