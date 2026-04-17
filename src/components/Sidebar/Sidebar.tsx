import type { FC } from 'react';

interface SidebarProps {
  syncing: boolean;
  lastSynced?: string;
}

const Sidebar: FC<SidebarProps> = ({ syncing, lastSynced }) => {
  return (
    <aside className="w-[220px] bg-sidebar border-l border-border/50 flex flex-col py-6 shrink-0 h-screen sticky top-0 z-10 md:w-[220px] sm:w-16 max-[560px]:hidden">
      {/* Logo */}
      <div className="px-5 pb-8 border-b border-border/50 mb-2">
        <div className="text-2xl font-bold text-gold tracking-wider font-amiri sm:max-md:hidden">
          ديوان
        </div>
        <div className="text-[10px] text-text-dim/70 mt-1 font-sans ltr text-right sm:max-md:hidden">
          diwan · poetry vault
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-4 flex-1">
        {[
          { label: 'كل الأبيات', active: true },
          { label: 'الشعراء', active: false },
          { label: 'المصادر', active: false },
          { label: 'المفضلة', active: false },
          { label: 'الإعدادات', active: false },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-6 py-3 text-sm cursor-pointer transition-all duration-200 font-sans
              ${item.active
                ? 'text-gold bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.08)] border-r-[3px] border-gold'
                : 'text-text-dim hover:text-text hover:bg-white/[0.02]'
              }
              sm:max-md:justify-center sm:max-md:px-0`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
            <span className="sm:max-md:hidden">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Sync badge */}
      <div className="mx-4 mb-6 bg-sync-bg border border-sync-border rounded-[10px] p-3">
        <div className="flex items-center gap-2.5 text-[11px] font-sans">
          <div
            className={`w-[7px] h-[7px] rounded-full shrink-0 ${
              syncing ? 'bg-gold animate-[pulse-sync_2s_infinite]' : 'bg-sync'
            }`}
          />
          <span className="text-sync-text font-medium sm:max-md:hidden">
            {syncing ? 'جارٍ المزامنة...' : `متزامن · ${lastSynced || 'الآن'}`}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
