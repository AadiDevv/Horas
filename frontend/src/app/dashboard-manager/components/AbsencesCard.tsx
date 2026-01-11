import { UserX } from "lucide-react";
import { getAbsenceColorFromLabelOrType } from '../config/timelineStylesConfig';

interface Absence {
  id?: number;
  employeNom: string;
  type: string;
  dateDebut: string;
  dateFin: string;
}

interface AbsencesCardProps {
  absences: Absence[];
  absencesEnAttente: number;
}

export default function AbsencesCard({
  absences = [],
  absencesEnAttente = 0,
}: AbsencesCardProps) {

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(51, 51, 51, 0.1)" }}
          >
            <UserX size={24} style={{ color: "#333333" }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: "#333333" }}>
            Absences du jour
          </h3>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold" style={{ color: "#333333" }}>
            {absencesEnAttente}
          </span>
          <span className="text-sm text-gray-600">
            demande{absencesEnAttente > 1 ? "s" : ""} à valider
          </span>
        </div>
      </div>

      {absences.length > 0 ? (
        <div className="space-y-2">
          {absences.slice(0, 3).map((absence, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br from-gray-800 to-black">
                  {absence.employeNom
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium" style={{ color: "#333333" }}>
                    {absence.employeNom}
                  </span>
                  <span className="text-xs text-gray-500">{absence.type}</span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(absence.dateDebut)} -{" "}
                {formatDate(absence.dateFin)}
              </span>
            </div>
          ))}
          {absences.length > 3 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              +{absences.length - 3} autre{absences.length - 3 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: "rgba(51, 51, 51, 0.1)" }}
          >
            <UserX size={28} style={{ color: "#333333" }} />
          </div>
          <p className="text-gray-600 font-medium">Aucune absence en cours</p>
          <p className="text-sm text-gray-500 mt-1">
            Toute l'équipe est présente !
          </p>
        </div>
      )}
    </div>
  );
}
