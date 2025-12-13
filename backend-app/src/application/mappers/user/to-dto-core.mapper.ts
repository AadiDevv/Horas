import {
    User_Core,
    UserEmployee_Core,
    UserManager_Core
} from "@/domain/entities/user";
import {
    UserReadEmployeeDTO_Core,
    UserReadManagerDTO_Core,
    UserReadDTO_Core,
} from "@/application/DTOS/";
import { UserMapper as UserMapperUtils } from "./utils.mapper";

export namespace UserMapper {

    export class FromEntityCore {
     
        public static toReadUserDTO_Core(user: User_Core): UserReadDTO_Core {
            const {hashedPassword, ...userData} = user;
            return {
                ...userData
            };
        }
        public static toReadDTO_Core(user: UserEmployee_Core | UserManager_Core): UserReadEmployeeDTO_Core | UserReadManagerDTO_Core {
            if (UserMapperUtils.isUserEmployee(user)) {
                return this.toEmployeeReadDTO_Core(user);
            }else if(UserMapperUtils.isUserManager(user)) {
                return this.toManagerReadDTO_Core(user);
            }
            throw new Error("Invalid user type");
        }
        public static toEmployeeReadDTO_Core(employee: UserEmployee_Core): UserReadEmployeeDTO_Core {
            const {hashedPassword, ...employeeData} = employee;
            return {
                ...employeeData
            };
        }
        public static toManagerReadDTO_Core(manager: UserManager_Core): UserReadManagerDTO_Core {
            const {hashedPassword, ...managerData} = manager;
            return {
                ...managerData
            };
        }
    
   
    }
    
}