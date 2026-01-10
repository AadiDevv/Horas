import { Timesheet_L1 } from "@/domain/entities/timesheet";
/**
 * Type pour une paire de timesheets
 */
export type PaireTimeSheet = {
    /**
     * Timesheet d'entrée
     */
    entry: Timesheet_L1;
    /**
     * Timesheet de sortie
     */
    exit: Timesheet_L1;
}