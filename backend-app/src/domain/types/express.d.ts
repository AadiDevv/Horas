import { Role } from './valueType';
import { UserAuthDTO } from '@/application/DTOS';

declare global {
    namespace Express {
        interface Request {
            user?: UserAuthDTO
        }
    }
}

export { };

