import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import FilterRow from './components/FilterRow/FilterRow';
import TicketGrid from './components/TicketGrid/TicketGrid';
import StatsRow from './components/StatsRow/StatsRow';
import AddPoemModal from './components/AddPoemModal/AddPoemModal';
import { usePoemVault } from './hooks/usePoemVault';
import type { Poem } from './types/poem';

function App() {
  const {
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
    <div className="flex w-full h-screen overflow-hidden bg-bg" dir="rtl">
      <Sidebar syncing={syncing} />
      
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-bg">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={openAdd}
        />

        <div className="content-scroll flex-1 overflow-y-auto flex flex-col pb-5">
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
          />
        </div>

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
