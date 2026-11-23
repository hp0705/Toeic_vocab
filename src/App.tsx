import React, { useState, useEffect, Suspense, lazy } from 'react';
import vocabData from '../data/vocab.json';
import { Entry } from './types/vocab';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { Today } from './routes/Today';
import { StudySession } from './routes/StudySession';
import { useStudyQueue } from './db/hooks';
import { STRINGS } from './constants/strings';

const Library = lazy(() => import('./routes/Library').then((m) => ({ default: m.Library })));
const Practice = lazy(() => import('./routes/Practice').then((m) => ({ default: m.Practice })));
const Settings = lazy(() => import('./routes/Settings').then((m) => ({ default: m.Settings })));

const entries = vocabData as Entry[];

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('today');
  const [libraryFilter, setLibraryFilter] = useState<string | undefined>(undefined);
  const {
    queue,
    progressMap,
    isLoading,
    studiedTodayCount,
    addMoreNewCards,
    submitGrade
  } = useStudyQueue(entries);

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (['today', 'study', 'practice', 'library', 'settings'].includes(hash)) {
        setCurrentTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.location.hash = `#${tab}`;
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      {currentTab !== 'study' && (
        <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-border py-3 px-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-primary">
                {STRINGS.appName}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">
                v1.0 MVP
              </span>
            </div>
            <span className="text-xs text-text-muted font-medium">
              {entries.length} từ vựng
            </span>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto pt-3">
        {currentTab === 'today' && (
          <Today
            allEntries={entries}
            queue={queue}
            isLoading={isLoading}
            studiedTodayCount={studiedTodayCount}
            addMoreNewCards={addMoreNewCards}
            onStartStudy={() => handleSelectTab('study')}
            onOpenLibraryWithFilter={(filter) => {
              setLibraryFilter(filter);
              handleSelectTab('library');
            }}
            onOpenPractice={() => handleSelectTab('practice')}
          />
        )}

        {currentTab === 'study' && (
          <StudySession
            allEntries={entries}
            queue={queue}
            progressMap={progressMap}
            submitGrade={submitGrade}
            onFinish={() => handleSelectTab('today')}
          />
        )}

        {currentTab === 'practice' && (
          <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Đang tải bài tập...</div>}>
            <Practice
              allEntries={entries}
              progressMap={progressMap}
              onStartStudy={() => handleSelectTab('study')}
            />
          </Suspense>
        )}

        {currentTab === 'library' && (
          <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Đang tải...</div>}>
            <Library
              allEntries={entries}
              progressMap={progressMap}
              initialFilter={libraryFilter}
            />
          </Suspense>
        )}

        {currentTab === 'settings' && (
          <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Đang tải...</div>}>
            <Settings />
          </Suspense>
        )}
      </main>

      {/* Fixed Bottom Navigation (hidden during active study flashcard session for full immersion) */}
      {currentTab !== 'study' && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          dueCount={queue.length}
        />
      )}
    </div>
  );
};
