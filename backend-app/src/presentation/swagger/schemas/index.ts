import { commonSchemas } from './common.schema';
import { healthSchemas } from './health.schema';
import { authSchemas } from './auth.schema';
import { userSchemas } from './user.schema';
import { teamSchemas } from './team.schema';
import { horaireSchemas } from './horaire.schema';
import { timesheetSchemas } from './timesheet.schema';

// #region Export All Schemas
export const schemas = {
    ...commonSchemas,
    ...healthSchemas,
    ...authSchemas,
    ...userSchemas,
    ...teamSchemas,
    ...horaireSchemas,
    ...timesheetSchemas
};
// #endregion

