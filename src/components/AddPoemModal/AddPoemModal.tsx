import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';
import type { Poem } from '../../types/poem';
import styles from './AddPoemModal.module.css';

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
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modal}>
        <h2 id="modal-title" className={styles.modalTitle}>
          {isEdit ? 'تعديل البيت' : 'إضافة بيت جديد'}
        </h2>

        {/* verse text */}
        <div className={styles.formGroup}>
          <label htmlFor="inp-text" className={styles.formLabel}>
            نص البيت
          </label>
          <textarea
            id="inp-text"
            name="text"
            className={styles.formTextarea}
            placeholder="اكتب البيت هنا..."
            value={form.text}
            onChange={handleChange}
          />
        </div>

        {/* poet + source in a 2-col row */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="inp-poet" className={styles.formLabel}>
              الشاعر
            </label>
            <input
              id="inp-poet"
              name="poet"
              className={styles.formInput}
              placeholder="اسم الشاعر"
              value={form.poet}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="inp-source" className={styles.formLabel}>
              المصدر
            </label>
            <input
              id="inp-source"
              name="source"
              className={styles.formInput}
              placeholder="الديوان أو الكتاب"
              value={form.source}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* tags */}
        <div className={styles.formGroup}>
          <label htmlFor="inp-tags" className={styles.formLabel}>
            الوسوم (مفصولة بفاصلة)
          </label>
          <input
            id="inp-tags"
            name="tags"
            className={styles.formInput}
            placeholder="حكمة، غزل، فخر"
            value={form.tags}
            onChange={handleChange}
          />
        </div>

        {/* actions */}
        <div className={styles.actions}>
          <button className={styles.btnSave} onClick={handleSave}>
            {isEdit ? 'حفظ التعديل' : 'حفظ البيت'}
          </button>
          <button className={styles.btnCancel} onClick={handleCancel}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPoemModal;
