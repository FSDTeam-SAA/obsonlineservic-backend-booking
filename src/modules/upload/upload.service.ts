import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async handleSingleImage(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    try {
      const publicId = `${Date.now()}-${file.originalname.split('.')[0]}`;
      const folder = 'obs_images';
      if (file.path) {
        const cloudinaryResult = await this.cloudinaryService.upload(file.path, publicId, folder);
        if (cloudinaryResult?.url) {
          return {
            url: cloudinaryResult.url,
            filename: file.filename,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(`Cloudinary upload skipped or failed, using local file: ${err?.message}`);
    }

    const port = this.configService.get<number>('app.port', 5000);
    return {
      url: `http://localhost:${port}/uploads/images/${file.filename}`,
      filename: file.filename,
    };
  }

  async handleMultipleImages(files: Express.Multer.File[]): Promise<{ urls: string[]; files: string[] }> {
    const urls: string[] = [];
    const filenames: string[] = [];

    for (const file of files) {
      const res = await this.handleSingleImage(file);
      urls.push(res.url);
      filenames.push(res.filename);
    }

    return { urls, files: filenames };
  }

  async handleSingleFile(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    const port = this.configService.get<number>('app.port', 5000);
    return {
      url: `http://localhost:${port}/uploads/files/${file.filename}`,
      filename: file.filename,
    };
  }
}
