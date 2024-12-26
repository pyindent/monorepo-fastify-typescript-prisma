// packages/services/src/services/__tests__/s3.service.spec.ts

import { S3Service } from './s3.service';
import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';

jest.mock('aws-sdk', () => {
  const mockS3Instance = {
    putObject: jest.fn().mockReturnThis(),
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    S3: jest.fn(() => mockS3Instance),
    config: {
      update: jest.fn(),
    },
  };
});

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('S3Service', () => {
  let s3Service: S3Service;
  const mockS3Instance = new AWS.S3();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set default values for bucketName and cloudFrontUrl when environment variables are not defined', () => {
      delete process.env.S3_BUCKET_NAME;
      delete process.env.CLOUDFRONT_URL;

      s3Service = new S3Service();

      expect(s3Service['bucketName']).toBe('');
      expect(s3Service['cloudFrontUrl']).toBe('');
    });
  });

  describe('uploadFile', () => {
    beforeEach(() => {
      process.env.S3_BUCKET_NAME = 'mock-bucket';
      process.env.CLOUDFRONT_URL = 'https://mock.cloudfront.net';
      s3Service = new S3Service();
    });

    it('should default file extension to "jpg" when filename has no extension', async () => {
      const mockBuffer = Buffer.from('test file content');
      const mockFilename = '';
      const mockMimetype = 'image/jpeg';
      const mockKey = 'mock-uuid.jpg';
      const mockUrl = `https://mock.cloudfront.net/${mockKey}`;

      (randomUUID as jest.Mock).mockReturnValue('mock-uuid');
      (mockS3Instance.putObject().promise as jest.Mock).mockResolvedValue(undefined);

      const result = await s3Service.uploadFile(mockBuffer, mockFilename, mockMimetype);

      expect(mockS3Instance.putObject).toHaveBeenCalledWith({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: mockKey,
        Body: mockBuffer,
        ContentType: mockMimetype,
      });
      expect(result).toBe(mockUrl);
    });
  });

  describe('deleteFile', () => {
    beforeEach(() => {
      process.env.S3_BUCKET_NAME = 'mock-bucket';
      s3Service = new S3Service();
    });

    it('should delete a file from S3', async () => {
      const mockKey = 'mock-key';

      (mockS3Instance.deleteObject().promise as jest.Mock).mockResolvedValue(undefined);

      await s3Service.deleteFile(mockKey);

      expect(mockS3Instance.deleteObject).toHaveBeenCalledWith({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: mockKey,
      });
    });
  });
});
