import { Role } from './valueType';
import { UserReadDTO } from '@/application/DTOS';

declare global {
    namespace Express {
        interface Request {
            user?: UserReadDTO
        }
    }
}

export { };

