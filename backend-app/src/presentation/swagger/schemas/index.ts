import { commonSchemas } from './common.schema';
import { healthSchemas } from './health.schema';
import { authSchemas } from './auth.schema';
import { userSchemas } from './user.schema';
import { teamSchemas } from './team.schema';
import { scheduleSchemas } from './schedule.schema';
import { timesheetSchemas } from './timesheet.schema';
import { absenceSchemas } from './absence.schema';

// #region Export All Schemas
export const schemas = {
    ...commonSchemas,
    ...healthSchemas,
    ...authSchemas,
    ...userSchemas,
    ...teamSchemas,
    ...scheduleSchemas,
    ...timesheetSchemas,
    ...absenceSchemas
};
// #endregion

