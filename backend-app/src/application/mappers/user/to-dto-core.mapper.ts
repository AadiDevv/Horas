import {
    User,
    UserEmployee_Core,
    UserManager_Core
} from "@/domain/entities/user";
import {
    UserReadEmployeeDTO_Core,
    UserReadManagerDTO_Core,
} from "@/application/DTOS/";
import { } from "@/application/DTOS/team.dto";
import { UserMapper as UserMapperUtils } from "./utils.mapper";

export namespace UserMapper {

    export class FromEntityCore {
     
        public static toReadDTO_Core(user: UserEmployee_Core | UserManager_Core): UserReadEmployeeDTO_Core | UserReadManagerDTO_Core {
            if (UserMapperUtils.isUserEmployee(user)) {
                return this.toEmployeeReadDTO_Core(user);
            }else if(UserMapperUtils.isUserManager(user)) {
                return this.toManagerReadDTO_Core(user);
            }
            throw new Error("Invalid user type");
        }
        private static toEmployeeReadDTO_Core(employee: UserEmployee_Core): UserReadEmployeeDTO_Core {
            return {
                ...employee
            };
        }
        private static toManagerReadDTO_Core(manager: UserManager_Core): UserReadManagerDTO_Core {
            return {
                ...manager
            };
        }
    
   
    }
    
}