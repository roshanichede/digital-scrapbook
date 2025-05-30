// lib/google-drive.ts - Google Drive API integration

import { google } from 'googleapis';

interface DriveFolder {
  id: string;
  name: string;
  files: DriveFile[];
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
}

interface MemoryData {
  title: string;
  caption: string;
  date?: string;
  location?: string;
}

export class GoogleDriveService {
  private drive;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth });
  }

  // Get all folders from a shared Drive folder
  async getFoldersFromSharedLink(sharedLink: string): Promise<DriveFolder[]> {
    try {
      // Extract folder ID from shared link
      const folderId = this.extractFolderIdFromLink(sharedLink);
      
      // List all subfolders
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
      });

      const folders: DriveFolder[] = [];
      
      for (const folder of response.data.files || []) {
        const files = await this.getFilesFromFolder(folder.id!);
        folders.push({
          id: folder.id!,
          name: folder.name!,
          files
        });
      }

      return folders;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw new Error('Failed to fetch folders from Google Drive');
    }
  }

  // Get files from a specific folder
  async getFilesFromFolder(folderId: string): Promise<DriveFile[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink)',
      });

      return response.data.files?.map(file => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        webViewLink: file.webViewLink!,
        webContentLink: file.webContentLink!,
        thumbnailLink: file.thumbnailLink
      })) || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      throw new Error('Failed to fetch files from folder');
    }
  }

  // Parse memory data from text file
  async parseMemoryTextFile(fileId: string): Promise<MemoryData | null> {
    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      });

      const content = response.data as string;
      return this.parseMemoryContent(content);
    } catch (error) {
      console.error('Error reading text file:', error);
      return null;
    }
  }

  // Parse memory content from text
  private parseMemoryContent(content: string): MemoryData {
    const lines = content.split('\n');
    const data: MemoryData = {
      title: '',
      caption: ''
    };

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      switch (key.toLowerCase().trim()) {
        case 'title':
          data.title = value;
          break;
        case 'caption':
          data.caption = value;
          break;
        case 'date':
          data.date = value;
          break;
        case 'location':
          data.location = value;
          break;
      }
    }

    return data;
  }

  // Extract folder ID from Google Drive share link
  private extractFolderIdFromLink(link: string): string {
    const patterns = [
      /\/folders\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        return match[1];
      }
    }

    throw new Error('Invalid Google Drive folder link');
  }

  // Check if file is an image
  isImageFile(file: DriveFile): boolean {
    return file.mimeType.startsWith('image/');
  }

  // Check if file is a video
  isVideoFile(file: DriveFile): boolean {
    return file.mimeType.startsWith('video/');
  }

  // Check if file is a text file
  isTextFile(file: DriveFile): boolean {
    return file.mimeType === 'text/plain' || file.name.endsWith('.txt');
  }
}