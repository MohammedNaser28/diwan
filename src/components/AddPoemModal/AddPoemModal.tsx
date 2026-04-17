import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';
import type { Poem } from '../../types/poem';
import './AddPoemModal.css';

interface AddPoemModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the poem data. If editPoem is set, this is an update. */
  onSave: (poem: Omit<Poem, 'id'>) => void;
  /** When provided the modal switches to edit mode */
  editPoem?: Poem | null;
}

const EMPTY = { text: '', poet: '', source: '', tags: '' };

const AddPoemModal: FC<AddPoemModalProps> = ({ open, onClose, onSave, editPoem }) => {
  const [form, setForm] = useState(EMPTY);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = Boolean(editPoem);

  /* sync form when editPoem changes */
  useEffect(() => {
    if (editPoem) {
      setForm({
        text: editPoem.text,
        poet: editPoem.poet,
        source: editPoem.source,
        tags: editPoem.tags.join('، '),
      });
    } else {
      setForm(EMPTY);
    }
  }, [editPoem, open]);

  if (!open) return null;

  function handleOverlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSave() {
    const text = form.text.trim();
    if (!text) return;

    const tags = form.tags
      ? form.tags.split(/[,،]+/).map((t) => t.trim()).filter(Boolean)
      : [];

    onSave({ text, poet: form.poet.trim(), source: form.source.trim(), tags });
    setForm(EMPTY);
    onClose();
  }

  function handleCancel() {
    setForm(EMPTY);
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <h2 id="modal-title" className="modal-title">
          {isEdit ? 'تعديل البيت' : 'إضافة بيت جديد'}
        </h2>

        {/* verse text */}
        <div className="modal-field">
          <label htmlFor="inp-text" className="modal-label">
            نص البيت
          </label>
          <textarea
            id="inp-text"
            name="text"
            className="modal-textarea"
            placeholder="اكتب البيت هنا..."
            value={form.text}
            onChange={handleChange}
          />
        </div>

        {/* poet + source in a 2-col row */}
        <div className="modal-row">
          <div className="modal-field">
            <label htmlFor="inp-poet" className="modal-label">
              الشاعر
            </label>
            <input
              id="inp-poet"
              name="poet"
              className="modal-input"
              placeholder="اسم الشاعر"
              value={form.poet}
              onChange={handleChange}
            />
          </div>
          <div className="modal-field">
            <label htmlFor="inp-source" className="modal-label">
              المصدر
            </label>
            <input
              id="inp-source"
              name="source"
              className="modal-input"
              placeholder="الديوان أو الكتاب"
              value={form.source}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* tags */}
        <div className="modal-field">
          <label htmlFor="inp-tags" className="modal-label">
            الوسوم (مفصولة بفاصلة)
          </label>
          <input
            id="inp-tags"
            name="tags"
            className="modal-input"
            placeholder="حكمة، غزل، فخر"
            value={form.tags}
            onChange={handleChange}
          />
        </div>

        {/* actions */}
        <div className="modal-actions">
          <button
            className="modal-btn-primary"
            onClick={handleSave}
          >
            {isEdit ? 'حفظ التعديل' : 'حفظ البيت'}
          </button>
          <button
            className="modal-btn-secondary"
            onClick={handleCancel}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPoemModal;
