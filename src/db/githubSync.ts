import { exportBackup, importBackup } from './backup';

export interface GistSyncResult {
  success: boolean;
  gistId?: string;
  error?: string;
  count?: number;
}

export async function uploadToGitHubGist(token: string, existingGistId?: string): Promise<GistSyncResult> {
  if (!token.trim()) {
    return { success: false, error: 'Vui lòng nhập GitHub Token' };
  }

  try {
    const backupJson = await exportBackup();

    if (existingGistId) {
      // Update existing Gist
      const res = await fetch(`https://api.github.com/gists/${existingGistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${token.trim()}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'TOEIC Vocab Progress Backup (Auto-Sync)',
          files: {
            'toeic_vocab_sync.json': {
              content: backupJson
            }
          }
        })
      });

      if (!res.ok) {
        if (res.status === 404) {
          // Gist deleted, create a new one
          return uploadToGitHubGist(token);
        }
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.message || `Lỗi GitHub (${res.status})` };
      }

      const data = await res.json();
      return { success: true, gistId: data.id };
    } else {
      // Create new secret Gist
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `token ${token.trim()}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'TOEIC Vocab Progress Backup (Auto-Sync)',
          public: false,
          files: {
            'toeic_vocab_sync.json': {
              content: backupJson
            }
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.message || `Lỗi GitHub (${res.status})` };
      }

      const data = await res.json();
      return { success: true, gistId: data.id };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function downloadFromGitHubGist(token: string, gistId: string): Promise<GistSyncResult> {
  if (!token.trim() || !gistId.trim()) {
    return { success: false, error: 'Thiếu GitHub Token hoặc Gist ID' };
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId.trim()}`, {
      headers: {
        Authorization: `token ${token.trim()}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.message || `Lỗi tải Gist (${res.status})` };
    }

    const data = await res.json();
    const file = data.files?.['toeic_vocab_sync.json'];
    if (!file || !file.content) {
      return { success: false, error: 'Không tìm thấy file toeic_vocab_sync.json trong Gist' };
    }

    const importRes = await importBackup(file.content);
    if (!importRes.success) {
      return { success: false, error: importRes.error };
    }

    return { success: true, count: importRes.count, gistId };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function copySyncCodeToClipboard(): Promise<boolean> {
  try {
    const backupJson = await exportBackup();
    // Base64 encode for easy copying
    const code = btoa(unescape(encodeURIComponent(backupJson)));
    await navigator.clipboard.writeText(code);
    return true;
  } catch {
    return false;
  }
}

export async function restoreFromSyncCode(code: string): Promise<GistSyncResult> {
  try {
    const trimmed = code.trim();
    let jsonStr = '';
    if (trimmed.startsWith('{')) {
      jsonStr = trimmed;
    } else {
      jsonStr = decodeURIComponent(escape(atob(trimmed)));
    }
    const res = await importBackup(jsonStr);
    return { success: res.success, count: res.count, error: res.error };
  } catch (err) {
    return { success: false, error: 'Mã đồng bộ không hợp lệ: ' + String(err) };
  }
}
