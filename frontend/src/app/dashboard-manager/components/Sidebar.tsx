import { Users, Folder, Settings, Clock, Calendar, X } from 'lucide-react';
import { DashboardPage } from '../types';

interface SidebarProps {
  isOpen: boolean;
  currentPage: DashboardPage;
  onPageChange: (page: DashboardPage) => void;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, currentPage, onPageChange, onClose }: SidebarProps) {
  const handlePageChange = (page: DashboardPage) => {
    onPageChange(page);
    // Fermer la sidebar sur mobile après sélection
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const menuItems = [
    {
      id: 'dashboard' as DashboardPage,
      label: 'Tableau de bord',
      icon: null,
      customIcon: (
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-2 h-2 bg-current rounded-sm"></div>
          <div className="w-2 h-2 bg-current rounded-sm"></div>
          <div className="w-2 h-2 bg-current rounded-sm"></div>
          <div className="w-2 h-2 bg-current rounded-sm"></div>
        </div>
      )
    },
    { id: 'agents' as DashboardPage, label: 'Agents', icon: Users },
    { id: 'equipes' as DashboardPage, label: 'Équipes', icon: Folder },
    { id: 'pointages' as DashboardPage, label: 'Pointages', icon: Clock },
    { id: 'horaires' as DashboardPage, label: 'Horaires', icon: Calendar },
  ];

  return (
    <>
      {/* Backdrop mobile uniquement - s'affiche seulement quand sidebar ouverte sur mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar - avec animation slide sur mobile et hide/show sur desktop */}
      <aside className={`fixed lg:relative top-0 left-0 h-full w-[280px] lg:w-64 p-4 lg:p-6 bg-white lg:bg-white/60 lg:backdrop-blur-xl border-r border-gray-200/50 flex-col overflow-y-auto z-50 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${
        isOpen
          ? 'flex translate-x-0'
          : 'flex -translate-x-full lg:hidden'
      }`}>
        {/* Bouton fermer mobile uniquement */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Horas.</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer active:scale-95"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
                currentPage === item.id
                  ? 'bg-black text-white shadow-lg shadow-black/10'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.customIcon ? item.customIcon : item.icon && <item.icon size={20} strokeWidth={2} />}
              {item.label}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
