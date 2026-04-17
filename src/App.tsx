import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import FilterRow from './components/FilterRow/FilterRow';
import TicketGrid from './components/TicketGrid/TicketGrid';
import StatsRow from './components/StatsRow/StatsRow';
import AddPoemModal from './components/AddPoemModal/AddPoemModal';
import { usePoemVault } from './hooks/usePoemVault';
import { useFavorites } from './hooks/useFavorites';
import PoetsList from './components/PoetsList/PoetsList';
import SourcesList from './components/SourcesList/SourcesList';
import SettingsView from './components/SettingsView/SettingsView';
import type { Poem } from './types/poem';
import './App.css';

function App() {
  const {
    poems,
    filteredPoems,
    allTags,
    activeTag,
    setActiveTag,
    searchQuery,
    setSearchQuery,
    addPoem,
    updatePoem,
    deletePoem,
    syncing,
    stats,
  } = usePoemVault();

  const { favorites, toggleFavorite } = useFavorites();

  const [activeSection, setActiveSection] = useState('كل الأبيات');
  const [modalOpen, setModalOpen] = useState(false);
  const [editPoem, setEditPoem] = useState<Poem | null>(null);

  function openAdd() {
    setEditPoem(null);
    setModalOpen(true);
  }

  function openEdit(poem: Poem) {
    setEditPoem(poem);
    setModalOpen(true);
  }

  function handleSave(data: Omit<Poem, 'id'>) {
    if (editPoem) {
      updatePoem(editPoem.id, data);
    } else {
      addPoem(data);
    }
    handleClose();
  }

  function handleClose() {
    setModalOpen(false);
    setEditPoem(null);
  }

  return (
    <div className="app-container" dir="rtl">
      <Sidebar 
        syncing={syncing} 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <main className="app-main">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={openAdd}
        />

        {/* Conditional Page Rendering */}
        <div className="app-content content-scroll">
          
          {/* PAGE: All Poems */}
          {activeSection === 'كل الأبيات' && (
            <>
              <FilterRow
                tags={allTags}
                activeTag={activeTag}
                onChange={setActiveTag}
              />
              <TicketGrid
                poems={filteredPoems}
                onAddClick={openAdd}
                onEdit={openEdit}
                onDelete={deletePoem}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </>
          )}

          {/* PAGE: Favorites */}
          {activeSection === 'المفضلة' && (
            <>
              <div className="page-header">
                <h2 className="page-title">قصائدي المفضلة</h2>
              </div>
              <TicketGrid
                poems={poems.filter(p => favorites.includes(p.id))}
                onAddClick={openAdd}
                onEdit={openEdit}
                onDelete={deletePoem}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </>
          )}

          {/* PAGE: Poets */}
          {activeSection === 'الشعراء' && (
            <PoetsList poems={poems} />
          )}

          {/* PAGE: Sources */}
          {activeSection === 'المصادر' && (
            <SourcesList poems={poems} />
          )}

          {/* PAGE: Settings */}
          {activeSection === 'الإعدادات' && (
            <SettingsView />
          )}

        </div>

        {/* Global Stats Footer */}
        <StatsRow
          poemCount={stats.poemCount}
          poetCount={stats.poetCount}
          sourceCount={stats.sourceCount}
          tagCount={stats.tagCount}
        />
      </main>

      <AddPoemModal
        open={modalOpen}
        onClose={handleClose}
        onSave={handleSave}
        editPoem={editPoem}
      />
    </div>
  );
}

export default App;
