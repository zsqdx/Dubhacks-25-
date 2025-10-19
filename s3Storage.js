// S3 Storage for SnapSyllabus
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'snapsyllabus-content';

export const S3Storage = {
  // ===== USER MANAGEMENT =====

  async saveUserProfile(profile) {
    const key = `users/${profile.userId}/profile.json`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(profile),
      ContentType: 'application/json',
    }));

    return key;
  },

  async getUserProfile(userId) {
    try {
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `users/${userId}/profile.json`,
      }));

      const body = await response.Body?.transformToString();
      return JSON.parse(body || 'null');
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  },

  async updateCanvasToken(userId, canvasToken, canvasUserId) {
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error('User profile not found');

    profile.canvasToken = canvasToken;
    profile.canvasUserId = canvasUserId;

    await this.saveUserProfile(profile);
  },

  // ===== WORKSHEETS =====

  async saveWorksheet(worksheet) {
    const key = `users/${worksheet.userId}/worksheets/${worksheet.id}.json`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(worksheet),
      ContentType: 'application/json',
    }));

    return key;
  },

  async getWorksheet(userId, worksheetId) {
    try {
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `users/${userId}/worksheets/${worksheetId}.json`,
      }));

      const body = await response.Body?.transformToString();
      return JSON.parse(body || 'null');
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  },

  async listUserWorksheets(userId) {
    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `users/${userId}/worksheets/`,
    }));

    return (response.Contents || []).map(obj => obj.Key || '');
  },

  // ===== STUDY SCHEDULES =====

  async saveSchedule(schedule) {
    const key = `users/${schedule.userId}/schedules/${schedule.id}.json`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(schedule),
      ContentType: 'application/json',
    }));

    return key;
  },

  async getSchedule(userId, scheduleId) {
    try {
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `users/${userId}/schedules/${scheduleId}.json`,
      }));

      const body = await response.Body?.transformToString();
      return JSON.parse(body || 'null');
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  },

  async listUserSchedules(userId) {
    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `users/${userId}/schedules/`,
    }));

    return (response.Contents || []).map(obj => obj.Key || '');
  },

  // ===== GENERAL CONTENT =====

  async saveContent(userId, folder, filename, content) {
    const key = `users/${userId}/${folder}/${filename}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: typeof content === 'string' ? content : JSON.stringify(content),
      ContentType: typeof content === 'string' ? 'text/plain' : 'application/json',
    }));

    return key;
  },

  async getContent(userId, folder, filename) {
    try {
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `users/${userId}/${folder}/${filename}`,
      }));

      const body = await response.Body?.transformToString();

      try {
        return JSON.parse(body || 'null');
      } catch {
        return body;
      }
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  },

  async listAllUserContent(userId) {
    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `users/${userId}/`,
    }));

    return (response.Contents || []).map(obj => obj.Key || '');
  },
};

// Helper to generate IDs
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
