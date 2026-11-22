import React, { useState, useRef } from 'react';
import { useSettings } from '../db/hooks';
import { STRINGS } from '../constants/strings';
import { downloadBackupFile, importBackup } from '../db/backup';
import { db } from '../db/index';
import { Button } from '../components/ui/Button';
import { Download, Upload, Trash2, Volume2, Target, Moon, Sun, Laptop } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

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
        setImportMessage(STRINGS.settings.importSuccess(res.count));
      } else {
        setImportMessage(STRINGS.settings.importFailed);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

      {/* Backup & Restore */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-sm space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-text">{STRINGS.settings.backupSection}</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {STRINGS.settings.backupDescription}
          </p>
        </div>

        {importMessage && (
          <div className="p-2.5 rounded bg-primary-light text-primary text-xs font-medium">
            {importMessage}
          </div>
        )}

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
