import { ValidationError } from "@/domain/error/AppError";
import { Timesheet_Core, Timesheet_L1 } from "@/domain/entities/timesheet";
import { ITimesheet } from "@/domain/interfaces/timesheet.interface";
import { AdjacentTimeSheet } from "@/application/types/adjacentTimeSheets";

/**
 * Service de validation métier pour les timesheets
 * Centralise toutes les règles de validation de timeline
 */
export class TimesheetValidationService {

    constructor(private readonly R_timesheet: ITimesheet) {}

    // #region Timeline Validation

    /**
     * Valide qu'une paire de timesheets respecte l'ordre chronologique de la timeline
     * Utilise la position ACTUELLE de la paire pour déterminer les bornes,
     * puis valide que les NOUVELLES positions restent dans ces bornes
     *
     * @param employeId - ID de l'employé
     * @param oldEntry - Timesheet d'entrée actuel (avant modification)
     * @param oldExit - Timesheet de sortie actuel (avant modification)
     * @param newEntry - Timesheet d'entrée à valider
     * @param newExit - Timesheet de sortie à valider
     */
    async validateTimestampPositionPair(
        employeId: number,
        oldEntry: Timesheet_L1,
        oldExit: Timesheet_L1,
        newEntry: Timesheet_L1,
        newExit: Timesheet_L1
    ): Promise<void> {

        // Récupérer les adjacents de la position ACTUELLE de la paire (oldEntry)
        const adjacent: AdjacentTimeSheet = await this.R_timesheet.getAdjacentTimesheets(
            employeId,
            oldEntry,
            [oldEntry.id, oldExit.id]
        );

        // ===== VALIDATION 1: newEntry ne doit pas dépasser le previous =====
        if (adjacent.previous && newEntry.timestamp < adjacent.previous.timestamp) {
            const previousType = adjacent.previous.clockin ? 'entrée' : 'sortie';
            throw new ValidationError(
                `L'entrée (${newEntry.timestamp.toLocaleTimeString()}) chevauche le pointage précédent (${previousType}) ` +
                `à ${adjacent.previous.timestamp.toLocaleTimeString()}. ` +
                `Conseil: Déplacez l'entrée après ${adjacent.previous.timestamp.toLocaleTimeString()}.`
            );
        }

        // ===== VALIDATION 2: newExit ne doit pas dépasser le next =====
        if (adjacent.next && newExit.timestamp > adjacent.next.timestamp) {
            const nextType = adjacent.next.clockin ? 'entrée' : 'sortie';
            throw new ValidationError(
                `La sortie (${newExit.timestamp.toLocaleTimeString()}) chevauche le pointage suivant (${nextType}) ` +
                `à ${adjacent.next.timestamp.toLocaleTimeString()}. ` +
                `Conseil: Déplacez la sortie avant ${adjacent.next.timestamp.toLocaleTimeString()}.`
            );
        }
    }

    /**
     * Valide qu'un timestamp unique respecte l'ordre chronologique de la timeline
     * Utilise la position ACTUELLE du timesheet pour déterminer les bornes,
     * puis valide que la NOUVELLE position reste dans ces bornes
     *
     * @param employeId - ID de l'employé
     * @param oldTimestamp - Timesheet actuel (avant modification)
     * @param newTimestamp - Timesheet à valider
     */
    async validateTimestampPosition(
        employeId: number,
        oldTimestamp: Timesheet_L1,
        newTimestamp: Timesheet_L1
    ): Promise<void> {

        // Récupérer les adjacents de la position ACTUELLE
        const adjacent: AdjacentTimeSheet = await this.R_timesheet.getAdjacentTimesheets(
            employeId,
            oldTimestamp,
            [oldTimestamp.id]
        );

        const type = newTimestamp.clockin ? 'entrée' : 'sortie';

        // ===== VALIDATION 1: Ne doit pas dépasser le previous =====
        if (adjacent.previous && newTimestamp.timestamp < adjacent.previous.timestamp) {
            const previousType = adjacent.previous.clockin ? 'entrée' : 'sortie';
            throw new ValidationError(
                `Le pointage de ${type} (${newTimestamp.timestamp.toLocaleTimeString()}) ` +
                `chevauche le pointage précédent (${previousType}) à ${adjacent.previous.timestamp.toLocaleTimeString()}. ` +
                `Conseil: Déplacez le pointage après ${adjacent.previous.timestamp.toLocaleTimeString()}.`
            );
        }

        // ===== VALIDATION 2: Ne doit pas dépasser le next =====
        if (adjacent.next && newTimestamp.timestamp > adjacent.next.timestamp) {
            const nextType = adjacent.next.clockin ? 'entrée' : 'sortie';
            throw new ValidationError(
                `Le pointage de ${type} (${newTimestamp.timestamp.toLocaleTimeString()}) ` +
                `chevauche le pointage suivant (${nextType}) à ${adjacent.next.timestamp.toLocaleTimeString()}. ` +
                `Conseil: Déplacez le pointage avant ${adjacent.next.timestamp.toLocaleTimeString()}.`
            );
        }
    }

    /**
     * Valide qu'un nouveau timestamp est postérieur au dernier existant
     * Utilisé lors de la création d'un timesheet
     *
     * @param lastTimesheet - Dernier timesheet de l'employé (peut être null)
     * @param timestamp - Nouveau timestamp à valider
     */
    validateTimestampChronology(lastTimesheet: Timesheet_Core | null, timestamp: Date): void {
        if (!lastTimesheet) return;

        const lastMinutes = Math.floor(lastTimesheet.timestamp.getTime() / 60000);
        const newMinutes = Math.floor(timestamp.getTime() / 60000);

        if (newMinutes < lastMinutes) {
            const lastDate = lastTimesheet.timestamp;
            const formattedDate = lastDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const formattedTime = lastDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            throw new ValidationError(
                `Le pointage doit être postérieur au dernier pointage effectué le ${formattedDate} à ${formattedTime}`
            );
        }
    }

    // #endregion
}
