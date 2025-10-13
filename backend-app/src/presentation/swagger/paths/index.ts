import { healthPaths } from './health.paths';
import { authPaths } from './auth.paths';
import { userPaths } from './user.paths';
import { equipePaths } from './equipe.paths';
import { horairePaths } from './horaire.paths';
import { pointagePaths } from './pointage.paths';

// #region Export All Paths
export const paths = {
    ...healthPaths,
    ...authPaths,
    ...userPaths,
    ...equipePaths,
    ...horairePaths,
    ...pointagePaths
};
// #endregion

