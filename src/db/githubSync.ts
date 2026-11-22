import { exportBackup, importBackup } from './backup';

export interface GistSyncResult {
  success: boolean;
  gistId?: string;
  error?: string;
  count?: number;
}

function cleanToken(token: string): string {
  return token.trim().replace(/^(Bearer|token)\s+/i, '');
}

function getHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${cleanToken(token)}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
}

function formatErrorMessage(status: number, rawMessage?: string): string {
  if (status === 401) {
    return 'Lỗi 401: Token không đúng hoặc đã bị thu hồi. Vui lòng kiểm tra lại mã Token.';
  }
  if (status === 403) {
    return 'Lỗi 403: Token chưa được cấp quyền "gist". Hãy tạo lại token và tích chọn quyền "gist".';
  }
  if (status === 404) {
    return 'Lỗi 404: Không tìm thấy file Gist tương ứng.';
  }
  return rawMessage ? `Lỗi GitHub (${status}): ${rawMessage}` : `Lỗi kết nối GitHub (${status})`;
}

export async function uploadToGitHubGist(token: string, existingGistId?: string): Promise<GistSyncResult> {
  const cToken = cleanToken(token);
  if (!cToken) {
    return { success: false, error: 'Vui lòng nhập GitHub Token của bạn' };
  }

  try {
    const backupJson = await exportBackup();

    if (existingGistId) {
      // Update existing Gist
      const res = await fetch(`https://api.github.com/gists/${existingGistId.trim()}`, {
        method: 'PATCH',
        headers: getHeaders(cToken),
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
          // Gist deleted, recreate a new one
          return uploadToGitHubGist(token);
        }
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: formatErrorMessage(res.status, errData.message) };
      }

      const data = await res.json();
      return { success: true, gistId: data.id };
    } else {
      // Create new secret Gist
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: getHeaders(cToken),
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
        return { success: false, error: formatErrorMessage(res.status, errData.message) };
      }

      const data = await res.json();
      return { success: true, gistId: data.id };
    }
  } catch (err) {
    return { success: false, error: 'Không thể kết nối đến GitHub: ' + String(err) };
  }
}

export async function downloadFromGitHubGist(token: string, gistId: string): Promise<GistSyncResult> {
  const cToken = cleanToken(token);
  if (!cToken || !gistId.trim()) {
    return { success: false, error: 'Cần có đủ GitHub Token và Gist ID để tải về' };
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId.trim()}`, {
      headers: getHeaders(cToken)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: formatErrorMessage(res.status, errData.message) };
    }

    const data = await res.json();
    const file = data.files?.['toeic_vocab_sync.json'];
    if (!file || !file.content) {
      return { success: false, error: 'Không tìm thấy file toeic_vocab_sync.json trong Gist này' };
    }

    const importRes = await importBackup(file.content);
    if (!importRes.success) {
      return { success: false, error: importRes.error };
    }

    return { success: true, count: importRes.count, gistId };
  } catch (err) {
    return { success: false, error: 'Lỗi tải Gist: ' + String(err) };
  }
}

export async function copySyncCodeToClipboard(): Promise<boolean> {
  try {
    const backupJson = await exportBackup();
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
