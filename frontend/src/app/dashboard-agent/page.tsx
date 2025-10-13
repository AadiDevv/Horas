'use client';

import { useState, useEffect } from 'react';
import { Clock, Menu, Bell, Play, Pause, AlertCircle, X, Loader2 } from 'lucide-react';

// Mock Data
const mockUsers = [
  {
    id: 1,
    prenom: "Manijay",
    nom: "Gupta",
    email: "manijay@example.com",
    role: "employe",
    isActive: true,
    telephone: "+33 6 12 34 56 78",
    equipeId: 5,
    plageHoraireId: 2,
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-15T14:30:00.000Z",
    lastLoginAt: "2025-10-07T10:30:00.000Z",
    deletedAt: null
  }
];

// Service API avec Mock
const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = true; // ⚠️ Passer à false quand le backend est prêt

async function getUser(userId: number) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.id === userId);
    console.log('🔍 Mock GET /api/users/' + userId);
    console.log('✅ Réponse:', user);
    
    return {
      success: true,
      data: user,
      message: "Utilisateur récupéré avec succès",
      timestamp: new Date().toISOString()
    };
  }
  
  const requete = await fetch(`${API_BASE_URL}/api/users/${userId}`);
  if (!requete.ok) {
    throw new Error("Erreur récupération utilisateur");
  }
  const user = await requete.json();
  return user;
}

async function updateUser(userId: number, updates: any) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    const updatedUser = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    mockUsers[userIndex] = updatedUser;
    
    console.log('🔄 Mock PATCH /api/users/' + userId);
    console.log('📝 Données envoyées:', updates);
    console.log('✅ Utilisateur mis à jour:', updatedUser);
    
    return {
      success: true,
      data: updatedUser,
      message: "Utilisateur modifié avec succès",
      timestamp: new Date().toISOString()
    };
  }
  
  const requete = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  if (!requete.ok) {
    throw new Error("Erreur mise à jour");
  }
  const user = await requete.json();
  return user;
}

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('Matrix Domain');
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    photo: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  type TimeLog = { start: string; end?: string };
  const [timeLogs, setTimeLogs] = useState<Record<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', TimeLog[]>>({
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: []
  });
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [currentDayLogs, setCurrentDayLogs] = useState<{start: string, end?: string}>({start: ''});

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Charger les données utilisateur au montage
    loadUserData();
    
    // Fermer le dropdown si on clique ailleurs
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      clearInterval(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userId = 1; // TODO: Récupérer depuis JWT/Auth
      const response = await getUser(userId);
      
      if (response.success) {
        setUserData(response.data);
        setFormData({
          prenom: response.data.prenom,
          nom: response.data.nom,
          email: response.data.email,
          photo: response.data.photo || '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        if (response.data.photo) {
          setPhotoPreview(response.data.photo);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${dayName} ${day}, ${month} ${year} | ${hours}:${minutes}`;
  };

  const getDayKey = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()] as keyof typeof timeLogs;
  };

  const handleClockIn = () => {
    setIsClockingIn(true);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setCurrentDayLogs({ start: time });
  };

  const handleClockOut = () => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayKey = getDayKey();
    setTimeLogs(prev => ({
      ...prev,
      [dayKey]: [...prev[dayKey], { ...currentDayLogs, end: time }]
    }));
    setIsClockingIn(false);
    setCurrentDayLogs({ start: '' });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      
      // ✅ Pour l'instant, seule la route PATCH nom prenom et email fonctionne
      const response = await updateUser(userData.id, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.newPassword ? formData.newPassword : undefined,
        photo: formData.photo ? formData.photo : undefined,
      });
      
      if (response.success) {
        setUserData(response.data);
        setSuccessMessage('✅ user modifié avec succès !');
        
        // TODO: Implémenter plus tard
        console.log('⏳ À implémenter plus tard:');
        if (formData.newPassword) {
          console.log('  - Changement mot de passe');
        }
        if (photoPreview && photoPreview !== userData.photo) {
          console.log('  - Upload photo');
        }
        
        setTimeout(() => {
          setSettingsOpen(false);
          setSuccessMessage('');
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSettings = () => {
    if (userData) {
      setFormData({
        prenom: userData.prenom,
        nom: userData.nom,
        email: userData.email,
        photo: userData.photo || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSettingsOpen(true);
      setDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Déconnexion...');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

  const timeToPixels = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60 + minutes) * 1;
  };

  const getLogHeight = (log: {start: string, end?: string}) => {
    if (!log.end) {
      const now = new Date();
      const endMinutes = now.getHours() * 60 + now.getMinutes();
      const [startHours, startMinutes] = log.start.split(':').map(Number);
      const startMinutesTotal = startHours * 60 + startMinutes;
      return (endMinutes - startMinutesTotal) * 1;
    }
    const [startHours, startMinutes] = log.start.split(':').map(Number);
    const [endHours, endMinutes] = log.end.split(':').map(Number);
    return ((endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)) * 1;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold tracking-tight">Horas.</h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
          <span className="text-lg font-medium">Tableau de bord</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Dropdown Menu */}
          <div className="relative dropdown-container">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>

            {/* Dropdown Content */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleOpenSettings}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Paramètres
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              {loading ? (
                <p className="text-sm text-gray-400">Chargement...</p>
              ) : userData ? (
                <>
                  <p className="text-sm font-semibold">{userData.prenom} {userData.nom}</p>
                  <p className="text-xs text-gray-500 capitalize">{userData.role}</p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Utilisateur</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal - CRUD complet */}
      {settingsOpen && userData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Paramètres</h2>
              <button onClick={() => setSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo de profil */}
              <div className="flex flex-col items-center mb-6">
                <label className="block text-sm font-semibold mb-3 w-full text-center">Photo de profil</label>
                <div className="relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full"></div>
                  )}
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full rounded-full cursor-pointer opacity-0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Cliquez pour changer</p>
              </div>

              {/* Prénom */}
              <div>
                <label className="block text-sm font-semibold mb-2">Prénom</label>
                <input 
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold mb-2">Nom</label>
                <input 
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Mot de passe */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Changer le mot de passe</h3>
                
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Ancien mot de passe</label>
                  <input 
                    type="password"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Nouveau mot de passe</label>
                  <input 
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Confirmer le mot de passe</label>
                  <input 
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>

              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  {successMessage}
                </div>
              )}

              <button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex">

        {/* Main Dashboard */}
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-semibold mb-2">Aujourd'hui</h2>
              <p className="text-gray-600">{mounted && currentTime ? formatDate(currentTime) : 'Chargement...'}</p>
            </div>
            <button 
              onClick={isClockingIn ? handleClockOut : handleClockIn}
              className="flex items-center gap-6 px-8 py-4 bg-black text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition"
            >
              {isClockingIn ? 'Clock Out' : 'Émarger'}
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                {isClockingIn ? (
                  <Pause size={24} className="fill-black" />
                ) : (
                  <Play size={24} className="fill-black" />
                )}
              </div>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 rounded-3xl p-8">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Travaillé ce jour</h3>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-semibold">02:00:05</span>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <Clock size={28} className="text-gray-700" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Travaillé cette semaine</h3>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-semibold">40:00:05</span>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <Clock size={28} className="text-gray-700" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Retards ce mois</h3>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-semibold">2</span>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <AlertCircle size={28} className="text-gray-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Calendar View */}
          <div className="bg-gray-50 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Planning Hebdomadaire</h3>
              <button 
                onClick={() => setCurrentTime(new Date())}
                className="px-4 py-2 bg-white hover:bg-gray-100 rounded-xl font-medium text-sm border border-gray-200 transition"
              >
                Actualiser
              </button>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {dayKeys.map(day => (
                <div key={day} className="flex flex-col">
                  <div className="font-semibold text-gray-700 text-center mb-3 pb-2 border-b-2 border-gray-200">{day}</div>
                  <div className="flex-1 border-t-2 border-gray-200 pt-4 relative min-h-[200px]">
                    {timeLogs[day].length === 0 && !isClockingIn ? (
                      <span className="text-gray-400 text-xs text-center block">Aucune heure</span>
                    ) : (
                      <div className="space-y-2">
                        {timeLogs[day].map((log, idx) => (
                          <div 
                            key={idx}
                            className="bg-gradient-to-b from-gray-800 to-gray-700 text-white px-2 py-2 rounded-lg text-xs font-medium"
                            style={{ height: `${getLogHeight(log)}px`, minHeight: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                          >
                            <div>{log.start}</div>
                            <div className="text-center my-1">-</div>
                            <div>{log.end || 'en cours'}</div>
                          </div>
                        ))}
                        {isClockingIn && getDayKey() === day && (
                          <div 
                            className="bg-gradient-to-b from-blue-500 to-blue-600 text-white px-2 py-2 rounded-lg text-xs font-medium animate-pulse"
                            style={{ minHeight: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                          >
                            <div>{currentDayLogs.start}</div>
                            <div className="text-center my-1">-</div>
                            <div>en cours</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}