import { healthPaths } from './health.paths';
import { authPaths } from './auth.paths';
import { userPaths } from './user.paths';
import { teamPaths } from './team.paths';
import { schedulePaths } from './schedule.paths';
import { timesheetPaths } from './timesheet.paths';
import { absencePaths } from './absence.paths';

// #region Export All Paths
export const paths = {
    ...healthPaths,
    ...authPaths,
    ...userPaths,
    ...teamPaths,
    ...schedulePaths,
    ...timesheetPaths,
    ...absencePaths
};
// #endregion

