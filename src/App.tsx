import { useState } from 'react';
import Topbar from './components/Topbar/Topbar';
import FilterRow from './components/FilterRow/FilterRow';
import TicketGrid from './components/TicketGrid/TicketGrid';
import AddPoemModal from './components/AddPoemModal/AddPoemModal';
import { usePoemVault } from './hooks/usePoemVault';
import type { Poem } from './types/poem';
import './index.css';

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
  }

  function handleClose() {
    setModalOpen(false);
    setEditPoem(null);
  }

  return (
    <div className="app">
      <Topbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={openAdd}
      />

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
