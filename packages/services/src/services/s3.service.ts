// packages/services/src/services/s3.service.ts

import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';

export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;
  private cloudFrontUrl: string;

  constructor() {
    AWS.config.update({
      accessKeyId: process.env.access_key,
      secretAccessKey: process.env.secret_key,
      region: process.env.AWS_REGION,
    });

    this.s3 = new AWS.S3();
    this.bucketName = process.env.S3_BUCKET_NAME ?? '';
    this.cloudFrontUrl = process.env.CLOUDFRONT_URL ?? '';
  }

  /**
   * Faz o upload de um arquivo para S3 e retorna a URL do CloudFront.
   * @param buffer Conteúdo do arquivo em Buffer.
   * @param filename Nome original do arquivo (para extrair extensão).
   * @param mimetype Mime type do arquivo (para ContentType no S3).
   */
  async uploadFile(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
    const fileExtension = filename.split('.').pop() || 'jpg';
    const key = `${randomUUID()}.${fileExtension}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    await this.s3.putObject(params).promise();
    return `${this.cloudFrontUrl}/${key}`;
  }

  /**
   * Exclui arquivo de S3 a partir da key.
   */
  async deleteFile(key: string): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key
    };

    await this.s3.deleteObject(params).promise();
  }
}
