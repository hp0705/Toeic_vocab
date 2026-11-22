import React, { useState, useRef } from 'react';
import { useSettings } from '../db/hooks';
import { STRINGS } from '../constants/strings';
import { downloadBackupFile, importBackup } from '../db/backup';
import {
  uploadToGitHubGist,
  downloadFromGitHubGist,
  copySyncCodeToClipboard,
  restoreFromSyncCode
} from '../db/githubSync';
import { db } from '../db/index';
import { Button } from '../components/ui/Button';
import {
  Download,
  Upload,
  Trash2,
  Volume2,
  Target,
  Moon,
  Sun,
  Laptop,
  Cloud,
  CloudDownload,
  CloudUpload,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState(settings.githubToken || '');
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleExport = async () => {
    await downloadBackupFile();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const res = await importBackup(text);
      if (res.success) {
        setStatusMessage(STRINGS.settings.importSuccess(res.count));
      } else {
        setStatusMessage(STRINGS.settings.importFailed);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveGist = async () => {
    if (!tokenInput.trim()) {
      setStatusMessage('Vui lòng nhập GitHub Token của bạn');
      return;
    }
    setIsSyncing(true);
    setStatusMessage('Đang tải lên GitHub Gist...');
    try {
      const res = await uploadToGitHubGist(tokenInput.trim(), settings.githubGistId);
      if (res.success && res.gistId) {
        await updateSettings({ githubToken: tokenInput.trim(), githubGistId: res.gistId });
        setStatusMessage('Đã lưu tiến độ lên GitHub Gist thành công!');
      } else {
        setStatusMessage(`Lỗi: ${res.error || 'Không thể lưu lên GitHub'}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadGist = async () => {
    if (!tokenInput.trim() || !settings.githubGistId) {
      setStatusMessage('Cần có GitHub Token và Gist ID để tải về');
      return;
    }
    setIsSyncing(true);
    setStatusMessage('Đang tải dữ liệu từ GitHub Gist...');
    try {
      const res = await downloadFromGitHubGist(tokenInput.trim(), settings.githubGistId);
      if (res.success) {
        setStatusMessage(`Đã khôi phục thành công ${res.count || 0} từ từ GitHub!`);
      } else {
        setStatusMessage(`Lỗi: ${res.error || 'Không thể tải từ GitHub'}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyCode = async () => {
    const ok = await copySyncCodeToClipboard();
    if (ok) {
      setCopiedCode(true);
      setStatusMessage('Đã sao chép mã đồng bộ vào bộ nhớ tạm! Bạn có thể dán sang thiết bị khác.');
      setTimeout(() => setCopiedCode(false), 3000);
    } else {
      setStatusMessage('Không thể sao chép mã vào bộ nhớ tạm');
    }
  };

  const handleRestoreCode = async () => {
    if (!syncCodeInput.trim()) {
      setStatusMessage('Vui lòng dán mã đồng bộ vào ô bên dưới');
      return;
    }
    const res = await restoreFromSyncCode(syncCodeInput.trim());
    if (res.success) {
      setStatusMessage(`Khôi phục thành công ${res.count || 0} từ!`);
      setSyncCodeInput('');
    } else {
      setStatusMessage(`Lỗi: ${res.error}`);
    }
  };

  const handleReset = async () => {
    if (window.confirm(STRINGS.settings.resetConfirm)) {
      await db.progress.clear();
      await db.streak.clear();
      alert('Đã xóa toàn bộ tiến độ thành công!');
      window.location.reload();
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="space-y-6 pb-24 pt-2 max-w-lg mx-auto px-4">
      <h1 className="text-xl font-bold text-text">{STRINGS.settings.title}</h1>

      {statusMessage && (
        <div className="p-3 rounded-md bg-primary-light border border-primary/30 text-primary text-xs font-semibold leading-relaxed animate-in fade-in">
          {statusMessage}
        </div>
      )}

      {/* CLOUD SYNC SECTION */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-text">
          <Cloud size={18} className="text-primary" />
          <span>Đồng bộ Đám mây (Không sợ mất lịch sử)</span>
        </div>

        {/* 1. Quick Sync Code */}
        <div className="p-3 rounded-md bg-surface-2/60 border border-border/60 space-y-2">
          <div className="text-xs font-bold text-text">Cách 1: Sao chép mã chuyển nhanh (3 giây)</div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Bấm nút dưới để copy mã tiến độ, sau đó dán vào thiết bị khác để học tiếp ngay lập tức.
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyCode} className="text-xs flex-1">
              {copiedCode ? <Check size={14} className="mr-1 text-ok" /> : <Copy size={14} className="mr-1" />}
              {copiedCode ? 'Đã sao chép mã!' : 'Sao chép mã tiến độ'}
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={syncCodeInput}
              onChange={(e) => setSyncCodeInput(e.target.value)}
              placeholder="Dán mã đồng bộ vào đây..."
              className="flex-1 px-3 py-1.5 rounded bg-surface border border-border text-xs text-text placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button size="sm" variant="primary" onClick={handleRestoreCode} className="text-xs whitespace-nowrap">
              Khôi phục
            </Button>
          </div>
        </div>

        {/* 2. GitHub Gist Auto-Sync */}
        <div className="p-3 rounded-md bg-surface-2/60 border border-border/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-text">Cách 2: Tự động lưu vào GitHub của bạn</div>
            <a
              href="https://github.com/settings/tokens/new?scopes=gist&description=ToeicVocabSync"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Lấy Token 1 chạm <ExternalLink size={12} />
            </a>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Dán GitHub Token (quyền gist) để app tự động lưu tiến độ vào tài khoản GitHub của bạn vĩnh viễn.
          </p>

          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Dán GitHub Personal Access Token..."
            className="w-full px-3 py-2 rounded bg-surface border border-border text-xs text-text placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isSyncing || !tokenInput}
              onClick={handleSaveGist}
              className="text-xs"
            >
              <CloudUpload size={14} className="mr-1.5" />
              Lưu lên GitHub
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isSyncing || !tokenInput || !settings.githubGistId}
              onClick={handleLoadGist}
              className="text-xs"
            >
              <CloudDownload size={14} className="mr-1.5" />
              Tải từ GitHub
            </Button>
          </div>
          {settings.githubGistId && (
            <div className="text-[10px] text-text-muted truncate">
              Đang liên kết Gist ID: <span className="font-mono">{settings.githubGistId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Voice & Audio Settings */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-text">
          <Volume2 size={18} className="text-primary" />
          <span>Âm thanh & Phát âm</span>
        </div>

        {/* Accent */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">{STRINGS.settings.voiceAccent}</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => updateSettings({ accent: 'us' })}
              className={`py-2 px-3 rounded-md font-medium border text-center transition-colors cursor-pointer ${
                settings.accent === 'us'
                  ? 'bg-primary-light border-primary text-primary font-bold'
                  : 'bg-surface-2 border-border text-text'
              }`}
            >
              {STRINGS.settings.voiceUS}
            </button>
            <button
              onClick={() => updateSettings({ accent: 'uk' })}
              className={`py-2 px-3 rounded-md font-medium border text-center transition-colors cursor-pointer ${
                settings.accent === 'uk'
                  ? 'bg-primary-light border-primary text-primary font-bold'
                  : 'bg-surface-2 border-border text-text'
              }`}
            >
              {STRINGS.settings.voiceUK}
            </button>
          </div>
        </div>

        {/* Speech Rate */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">{STRINGS.settings.speechRate}</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[0.6, 0.8, 1.0].map((rate) => (
              <button
                key={rate}
                onClick={() => updateSettings({ speechRate: rate as 0.6 | 0.8 | 1.0 })}
                className={`py-2 px-3 rounded-md font-medium border text-center transition-colors cursor-pointer ${
                  settings.speechRate === rate
                    ? 'bg-primary-light border-primary text-primary font-bold'
                    : 'bg-surface-2 border-border text-text'
                }`}
              >
                {rate}×
              </button>
            ))}
          </div>
        </div>

        {/* Auto Play Audio */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
          <span className="font-medium text-text">{STRINGS.settings.autoPlay}</span>
          <input
            type="checkbox"
            checked={settings.autoPlayAudio}
            onChange={(e) => updateSettings({ autoPlayAudio: e.target.checked })}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Daily Goals */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-text">
          <Target size={18} className="text-primary" />
          <span>{STRINGS.settings.dailyGoals}</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted">{STRINGS.settings.newCardsPerDay}</label>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[10, 15, 20, 30].map((num) => (
              <button
                key={num}
                onClick={() => updateSettings({ newCardsPerDay: num })}
                className={`py-2 px-2 rounded-md font-medium border text-center transition-colors cursor-pointer ${
                  settings.newCardsPerDay === num
                    ? 'bg-primary-light border-primary text-primary font-bold'
                    : 'bg-surface-2 border-border text-text'
                }`}
              >
                {num} từ
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-sm space-y-3">
        <label className="text-xs font-semibold text-text-muted">{STRINGS.settings.theme}</label>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md border font-medium cursor-pointer ${
              settings.theme === 'light'
                ? 'bg-primary-light border-primary text-primary font-bold'
                : 'bg-surface-2 border-border text-text'
            }`}
          >
            <Sun size={15} />
            {STRINGS.settings.themeLight}
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md border font-medium cursor-pointer ${
              settings.theme === 'dark'
                ? 'bg-primary-light border-primary text-primary font-bold'
                : 'bg-surface-2 border-border text-text'
            }`}
          >
            <Moon size={15} />
            {STRINGS.settings.themeDark}
          </button>
          <button
            onClick={() => handleThemeChange('system')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md border font-medium cursor-pointer ${
              settings.theme === 'system'
                ? 'bg-primary-light border-primary text-primary font-bold'
                : 'bg-surface-2 border-border text-text'
            }`}
          >
            <Laptop size={15} />
            {STRINGS.settings.themeSystem}
          </button>
        </div>
      </div>

      {/* Backup File JSON */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-sm space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-text">Sao lưu File Ngoại tuyến</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {STRINGS.settings.backupDescription}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            <Download size={14} className="mr-1.5" />
            {STRINGS.settings.exportBtn}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload size={14} className="mr-1.5" />
            {STRINGS.settings.importBtn}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-2">
        <Button variant="danger" size="sm" fullWidth onClick={handleReset} className="text-xs">
          <Trash2 size={14} className="mr-1.5" />
          {STRINGS.settings.resetDataBtn}
        </Button>
      </div>
    </div>
  );
};
