"use client";

import { useState, useEffect } from "react";
import { Clock, Play, Pause, AlertCircle, X, Loader2 } from "lucide-react";
import Navbar from "../components/navbar";
import RoleProtection from "../middleware/roleProtection";

// Mock Data
const mockUsers = [
  {
    id: 1,
    prenom: "Manijay",
    nom: "Gupta",
    email: "manijay@example.com",
    role: "employe",
    oldPassword: "password123",
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
const USE_MOCK = true;

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

async function changePassword(userId: number, oldPassword: string, newPassword: string) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('🔒 Mock PATCH /api/users/' + userId + '/password');
    console.log('📝 Changement de mot de passe simulé');
    
    const user = mockUsers.find(u => u.id === userId);
    if (user && user.oldPassword !== oldPassword) {
      return {
        success: false,
        message: "L'ancien mot de passe est incorrect",
        timestamp: new Date().toISOString()
      };
    }
    
    if (!oldPassword) {
      return {
        success: false,
        message: "Ancien mot de passe requis",
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      message: "Mot de passe modifié avec succès",
      timestamp: new Date().toISOString()
    };
  }
  
  const requete = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  
  const response = await requete.json();
  
  if (!requete.ok || !response.success) {
    throw new Error(response.message || "Erreur lors du changement de mot de passe");
  }
  
  return response;
}

export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedDomain, setSelectedDomain] = useState("Matrix Domain");
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
    
    loadUserData();
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userId = 1;
      const response = await getUser(userId);
      
      if (response.success) {
        setUserData(response.data);
        setFormData({
          prenom: response.data.prenom,
          nom: response.data.nom,
          email: response.data.email,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const months = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

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

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');
      
      const wantsToChangePassword = formData.newPassword || formData.confirmPassword || formData.oldPassword;
      
      if (wantsToChangePassword) {
        if (!formData.oldPassword) {
          setErrorMessage('❌ L\'ancien mot de passe est requis pour changer le mot de passe');
          setSaving(false);
          return;
        }
        
        if (!formData.newPassword) {
          setErrorMessage('❌ Le nouveau mot de passe est requis');
          setSaving(false);
          return;
        }
        
        if (formData.newPassword.length < 6) {
          setErrorMessage('❌ Le nouveau mot de passe doit contenir au moins 6 caractères');
          setSaving(false);
          return;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          setErrorMessage('❌ Les mots de passe ne correspondent pas');
          setSaving(false);
          return;
        }
        
        const passwordResponse = await changePassword(
          userData.id,
          formData.oldPassword,
          formData.newPassword
        );
        
        if (!passwordResponse.success) {
          setErrorMessage('❌ ' + passwordResponse.message);
          setSaving(false);
          return;
        }
      }
      
      const response = await updateUser(userData.id, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      });
      
      if (response.success) {
        setUserData(response.data);
        const messages = ['✅ Informations modifiées avec succès !'];
        if (wantsToChangePassword) {
          messages.push('Mot de passe modifié avec succès !');
        }
        setSuccessMessage(messages.join(' '));
        
        setTimeout(() => {
          setSettingsOpen(false);
          setSuccessMessage('');
          setErrorMessage('');
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      setErrorMessage('❌ Erreur lors de la sauvegarde : ' + (error as Error).message);
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
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('');
      setErrorMessage('');
      setSettingsOpen(true);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Déconnexion...');
    window.location.href = '/login';
  };

  const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

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
    <RoleProtection allowedRoles={['manager', 'admin', 'employe']}>
    
      <div className="min-h-screen bg-white">
        {/* Navbar unique */}
        <Navbar 
          onOpenSettings={handleOpenSettings}
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Settings Modal */}
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
                <div>
                  <label className="block text-sm font-semibold mb-2">Prénom</label>
                  <input 
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Nom</label>
                  <input 
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-3">Changer le mot de passe</h3>
                  <p className="text-xs text-gray-500 mb-4">Laissez vide si vous ne souhaitez pas changer le mot de passe</p>
                  
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Ancien mot de passe *</label>
                    <input 
                      type="password"
                      value={formData.oldPassword}
                      onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="Requis pour changer le mot de passe"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Nouveau mot de passe * (min. 6 caractères)</label>
                    <input 
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="Au moins 6 caractères"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Confirmer le mot de passe *</label>
                    <input 
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="Retapez le nouveau mot de passe"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {errorMessage}
                  </div>
                )}

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
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Travaillé ce jour
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-semibold">02:00:05</span>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <Clock size={28} className="text-gray-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Travaillé cette semaine
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-semibold">40:00:05</span>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <Clock size={28} className="text-gray-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8">
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Retards ce mois
                </h3>
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
                      {timeLogs[day].length === 0 && !(isClockingIn && getDayKey() === day) ? (
                        <span className="text-gray-400 text-xs text-center block">Aucune heure</span>
                      ) : (
                        <div className="space-y-2">
                          {timeLogs[day].map((log, idx) => {
                            const height = getLogHeight(log);
                            const isSmall = height < 60;
                            
                            return (
                              <div 
                                key={idx}
                                className="bg-gradient-to-b from-gray-800 to-gray-700 text-white px-2 py-2 rounded-lg text-xs font-medium relative group"
                                style={{ 
                                  height: `${height}px`, 
                                  minHeight: '30px', 
                                  display: 'flex', 
                                  flexDirection: isSmall ? 'row' : 'column', 
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: isSmall ? '4px' : '0'
                                }}
                              >
                                {isSmall ? (
                                  <>
                                    <div className="text-[10px]">{log.start}</div>
                                    <div className="text-[10px]">→</div>
                                    <div className="text-[10px]">{log.end || 'en cours'}</div>
                                  </>
                                ) : (
                                  <>
                                    <div>{log.start}</div>
                                    <div className="text-center my-1">-</div>
                                    <div>{log.end || 'en cours'}</div>
                                  </>
                                )}
                                
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                  {log.start} - {log.end || 'en cours'}
                                  {log.end && (
                                    <div className="text-[10px] text-gray-400 mt-1">
                                      Durée: {Math.floor(((parseInt(log.end.split(':')[0]) * 60 + parseInt(log.end.split(':')[1])) - (parseInt(log.start.split(':')[0]) * 60 + parseInt(log.start.split(':')[1]))) / 60)}h {((parseInt(log.end.split(':')[0]) * 60 + parseInt(log.end.split(':')[1])) - (parseInt(log.start.split(':')[0]) * 60 + parseInt(log.start.split(':')[1]))) % 60}m
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
    </RoleProtection>
  );
}