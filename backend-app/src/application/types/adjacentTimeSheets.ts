import { Timesheet_Core, Timesheet_L1 } from "@/domain/entities/timesheet";

/**
 * Type pour les timesheets adjacents
 */
export type AdjacentTimeSheet = {
    /**
     * Timesheet précédent la periode de pointage
     */
    previous: Timesheet_L1 | null; 
    /**
     * Timesheet suivant la période de pointage
     */
    next: Timesheet_L1 | null;
}