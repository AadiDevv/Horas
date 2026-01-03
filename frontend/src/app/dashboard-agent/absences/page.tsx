"use client";

import { useState, useEffect, useCallback } from 'react';
import { UserX, Plus, Calendar as CalendarIcon, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/app/components/navbar';
import RoleProtection from '@/app/middleware/roleProtection';
import { getAbsences, createAbsence, Absence, AbsenceType } from '@/app/dashboard-manager/services/absenceService';
import Sidebar from '../components/Sidebar';

export default function MesAbsencesPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    // Récupérer l'ID de l'employé depuis le localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 User récupéré:', user);
        setEmployeeId(user.id);
      } catch (error) {
        console.error('Erreur parsing user:', error);
      }
    }
  }, []);

  const loadAbsences = useCallback(async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const response = await getAbsences({ employeId: employeeId });
      if (response.success && response.data) {
        // Trier par date (plus récentes en premier)
        const sorted = response.data.sort((a, b) =>
          new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime()
        );
        setAbsences(sorted);
      }
    } catch (error) {
      console.error('Erreur chargement absences:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      loadAbsences();
    }
  }, [employeeId, loadAbsences]);

  const handleCreateAbsence = () => {
    setShowModal(true);
  };

  const handleSaveAbsence = async (data: {
    type: AbsenceType;
    startDateTime: string;
    endDateTime: string;
    comments?: string;
  }) => {
    if (!employeeId) {
      console.error('❌ Pas d\'employeeId');
      return;
    }

    console.log('📝 Création absence pour employé:', employeeId, data);

    try {
      const result = await createAbsence({
        employeId: employeeId,
        type: data.type,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        comments: data.comments,
        status: 'en_attente' // Agent fait une demande
      });

      console.log('✅ Absence créée:', result);

      await loadAbsences();
      setShowModal(false);
    } catch (error) {
      console.error('❌ Erreur création absence:', error);
      throw error;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_attente':
        return <AlertCircle className="text-orange-500" size={20} />;
      case 'approuve':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'refuse':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'approuve':
        return 'Approuvée';
      case 'refuse':
        return 'Refusée';
      default:
        return status;
    }
  };


  const typeLabels: Record<string, string> = {
    'conges_payes': 'Congés payés',
    'conges_sans_solde': 'Congés sans solde',
    'maladie': 'Maladie',
    'formation': 'Formation',
    'teletravail': 'Télétravail',
    'autre': 'Autre'
  };

  return (
    <RoleProtection allowedRoles={['employe']}>
      <div className="min-h-screen bg-white">
        <Navbar />

        <div className="flex">
          <Sidebar />
          <div className="flex-1 px-8 py-8 bg-gray-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Mes Absences
              </h1>
              <p className="text-gray-600">
                Gérez vos demandes d'absence et consultez leur statut
              </p>
            </div>
            <button
              onClick={handleCreateAbsence}
              className="px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Nouvelle demande
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="text-orange-500" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">En attente</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {absences.filter(a => a.status === 'en_attente').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-green-500" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Approuvées</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {absences.filter(a => a.status === 'approuve').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="text-red-500" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Refusées</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {absences.filter(a => a.status === 'refuse').length}
              </p>
            </div>
          </div>

          {/* Liste des absences */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Historique des demandes</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Clock className="mx-auto mb-4 animate-spin text-gray-400" size={48} />
                <p className="text-gray-500">Chargement...</p>
              </div>
            ) : absences.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {absences.map((absence) => (
                  <div
                    key={absence.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(absence.status)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {typeLabels[absence.type]}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            absence.status === 'en_attente'
                              ? 'bg-orange-100 text-orange-700'
                              : absence.status === 'approuve'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {getStatusLabel(absence.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <CalendarIcon size={16} />
                            <span>
                              Du {new Date(absence.startDateTime).toLocaleDateString('fr-FR')}
                              {' au '}
                              {new Date(absence.endDateTime).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>

                        {absence.comments && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Commentaire : </span>
                              {absence.comments}
                            </p>
                          </div>
                        )}

                        {absence.validatedAt && (
                          <div className="mt-2 text-xs text-gray-500">
                            Validée le {new Date(absence.validatedAt).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <UserX className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  Aucune absence
                </p>
                <p className="text-gray-400 text-sm">
                  Vous n'avez pas encore fait de demande d'absence
                </p>
              </div>
            )}
          </div>

          {/* Modal de création */}
          {showModal && (
            <AbsenceRequestModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSave={handleSaveAbsence}
            />
          )}
        </div>
        </div>
      </div>
    </RoleProtection>
  );
}

// Composant modal temporaire (on va le créer dans un fichier séparé après)
function AbsenceRequestModal({
  isOpen,
  onClose,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    type: 'conges_payes' as AbsenceType,
    startDateTime: new Date().toISOString().substring(0, 10),
    endDateTime: new Date().toISOString().substring(0, 10),
    comments: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.startDateTime) > new Date(formData.endDateTime)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    setSaving(true);
    try {
      const startISO = `${formData.startDateTime}T08:00:00.000Z`;
      const endISO = `${formData.endDateTime}T18:00:00.000Z`;

      await onSave({
        ...formData,
        startDateTime: startISO,
        endDateTime: endISO
      });
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Nouvelle demande d'absence
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type d'absence
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AbsenceType })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              required
            >
              <option value="conges_payes">Congés payés</option>
              <option value="conges_sans_solde">Congés sans solde</option>
              <option value="maladie">Maladie</option>
              <option value="formation">Formation</option>
              <option value="teletravail">Télétravail</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDateTime}
                onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={formData.endDateTime}
                onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Commentaires (optionnel)
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Précisez la raison de votre absence..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-colors text-sm"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {saving ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
