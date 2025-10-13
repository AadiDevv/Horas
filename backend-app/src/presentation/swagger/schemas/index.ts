import { commonSchemas } from './common.schema';
import { healthSchemas } from './health.schema';
import { authSchemas } from './auth.schema';
import { userSchemas } from './user.schema';
import { equipeSchemas } from './equipe.schema';
import { horaireSchemas } from './horaire.schema';
import { pointageSchemas } from './pointage.schema';

// #region Export All Schemas
export const schemas = {
    ...commonSchemas,
    ...healthSchemas,
    ...authSchemas,
    ...userSchemas,
    ...equipeSchemas,
    ...horaireSchemas,
    ...pointageSchemas
};
// #endregion

