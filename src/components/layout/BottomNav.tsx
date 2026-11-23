import React from 'react';
import { Calendar, BookOpen, Layers, Settings, Brain } from 'lucide-react';
import { STRINGS } from '../../constants/strings';

export type NavTab = 'today' | 'study' | 'practice' | 'library' | 'settings';

export interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  dueCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, dueCount = 0 }) => {
  const tabs = [
    { id: 'today' as NavTab, label: STRINGS.nav.today, icon: Calendar },
    { id: 'study' as NavTab, label: STRINGS.nav.study, icon: BookOpen, badge: dueCount },
    { id: 'practice' as NavTab, label: STRINGS.nav.practice, icon: Brain },
    { id: 'library' as NavTab, label: STRINGS.nav.library, icon: Layers },
    { id: 'settings' as NavTab, label: STRINGS.nav.settings, icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-border shadow-sheet max-w-lg mx-auto">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors select-none cursor-pointer ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-text'
              }`}
            >
              <div className="relative">
                <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-bad text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
