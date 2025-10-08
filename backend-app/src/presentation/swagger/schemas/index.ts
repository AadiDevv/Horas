import { commonSchemas } from './common.schema';
import { healthSchemas } from './health.schema';
import { authSchemas } from './auth.schema';

// #region Export All Schemas
export const schemas = {
    ...commonSchemas,
    ...healthSchemas,
    ...authSchemas
};
// #endregion

