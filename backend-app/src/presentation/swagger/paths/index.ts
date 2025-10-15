import { healthPaths } from './health.paths';
import { authPaths } from './auth.paths';
import { userPaths } from './user.paths';
import { teamPaths } from './team.paths';
import { horairePaths } from './horaire.paths';
import { timesheetPaths } from './timesheet.paths';

// #region Export All Paths
export const paths = {
    ...healthPaths,
    ...authPaths,
    ...userPaths,
    ...teamPaths,
    ...horairePaths,
    ...timesheetPaths
};
// #endregion

