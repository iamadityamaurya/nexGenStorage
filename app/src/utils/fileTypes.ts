export interface FileCategoryInfo {
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other';
  color: string;
  badgeBg: string;
  iconName: string;
}

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const getFileExtension = (filename: string): string => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

export const getFileCategory = (filename: string): FileCategoryInfo => {
  const ext = getFileExtension(filename);

  const images = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'heic', 'tiff'];
  const videos = ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', '3gp'];
  const audio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'opus', 'wma'];
  const documents = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'md'];
  const archives = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'];
  const code = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'php', 'rb', 'sql', 'sh', 'yaml', 'yml'];

  if (images.includes(ext)) {
    return { category: 'image', color: '#38bdf8', badgeBg: 'rgba(56, 189, 248, 0.15)', iconName: 'Image' };
  }
  if (videos.includes(ext)) {
    return { category: 'video', color: '#a855f7', badgeBg: 'rgba(168, 85, 247, 0.15)', iconName: 'Video' };
  }
  if (audio.includes(ext)) {
    return { category: 'audio', color: '#ec4899', badgeBg: 'rgba(236, 72, 153, 0.15)', iconName: 'Music' };
  }
  if (documents.includes(ext)) {
    return { category: 'document', color: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.15)', iconName: 'FileText' };
  }
  if (archives.includes(ext)) {
    return { category: 'archive', color: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)', iconName: 'Archive' };
  }
  if (code.includes(ext)) {
    return { category: 'code', color: '#6366f1', badgeBg: 'rgba(99, 102, 241, 0.15)', iconName: 'Code' };
  }

  return { category: 'other', color: '#94a3b8', badgeBg: 'rgba(148, 163, 184, 0.15)', iconName: 'File' };
};

export const formatDate = (timestamp: number): string => {
  if (!timestamp) return 'Unknown Date';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
