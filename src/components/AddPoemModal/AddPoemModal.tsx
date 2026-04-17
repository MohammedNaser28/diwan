import { type FC, type MouseEvent, useEffect, useRef, useState } from 'react';
import type { Poem } from '../../types/poem';

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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] animate-[fade-in_0.15s_ease]"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-surface border border-border/50 rounded-[14px] w-[480px] max-w-[95%] p-[25px] rtl animate-[slide-up_0.18s_ease]">
        <h2 id="modal-title" className="font-amiri text-xl text-gold mb-5">
          {isEdit ? 'تعديل البيت' : 'إضافة بيت جديد'}
        </h2>

        {/* verse text */}
        <div className="mb-3.5">
          <label htmlFor="inp-text" className="text-xs text-text-dim mb-1.5 block">
            نص البيت
          </label>
          <textarea
            id="inp-text"
            name="text"
            className="w-full bg-bg border border-border/50 rounded-lg px-3 py-2 text-text text-[15px] rtl outline-none font-amiri leading-[1.9] resize-y min-h-[90px] transition-colors duration-200 focus:border-gold/35"
            placeholder="اكتب البيت هنا..."
            value={form.text}
            onChange={handleChange}
          />
        </div>

        {/* poet + source in a 2-col row */}
        <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
          <div className="mb-3.5">
            <label htmlFor="inp-poet" className="text-xs text-text-dim mb-1.5 block">
              الشاعر
            </label>
            <input
              id="inp-poet"
              name="poet"
              className="w-full bg-bg border border-border/50 rounded-lg px-3 py-2 text-text text-[13px] rtl outline-none font-sans transition-colors duration-200 focus:border-gold/35"
              placeholder="اسم الشاعر"
              value={form.poet}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3.5">
            <label htmlFor="inp-source" className="text-xs text-text-dim mb-1.5 block">
              المصدر
            </label>
            <input
              id="inp-source"
              name="source"
              className="w-full bg-bg border border-border/50 rounded-lg px-3 py-2 text-text text-[13px] rtl outline-none font-sans transition-colors duration-200 focus:border-gold/35"
              placeholder="الديوان أو الكتاب"
              value={form.source}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* tags */}
        <div className="mb-3.5">
          <label htmlFor="inp-tags" className="text-xs text-text-dim mb-1.5 block">
            الوسوم (مفصولة بفاصلة)
          </label>
          <input
            id="inp-tags"
            name="tags"
            className="w-full bg-bg border border-border/50 rounded-lg px-3 py-2 text-text text-[13px] rtl outline-none font-sans transition-colors duration-200 focus:border-gold/35"
            placeholder="حكمة، غزل، فخر"
            value={form.tags}
            onChange={handleChange}
          />
        </div>

        {/* actions */}
        <div className="flex gap-2.5 justify-start mt-5">
          <button
            className="bg-gold text-bg border-none rounded-lg px-[22px] py-2 text-[13px] cursor-pointer font-medium transition-colors duration-150 hover:bg-gold-hover"
            onClick={handleSave}
          >
            {isEdit ? 'حفظ التعديل' : 'حفظ البيت'}
          </button>
          <button
            className="bg-transparent text-text-dim border border-border/50 rounded-lg px-[18px] py-2 text-[13px] cursor-pointer transition-colors duration-150 hover:text-text"
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
