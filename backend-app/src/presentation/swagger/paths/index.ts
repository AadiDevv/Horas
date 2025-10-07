import { healthPaths } from './health.paths';
import { authPaths } from './auth.paths';

// #region Export All Paths
export const paths = {
    ...healthPaths,
    ...authPaths
};
// #endregion

