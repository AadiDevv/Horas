import { Users, Folder, Settings, Clock, Calendar } from 'lucide-react';
import { DashboardPage } from '../types';

interface SidebarProps {
  isOpen: boolean;
  currentPage: DashboardPage;
  onPageChange: (page: DashboardPage) => void;
}

export default function Sidebar({ isOpen, currentPage, onPageChange }: SidebarProps) {
  if (!isOpen) return null;

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
    <aside className="w-64 h-full p-6 bg-white/60 backdrop-blur-xl border-r border-gray-200/50 flex flex-col overflow-y-auto">
      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
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
  );
}
