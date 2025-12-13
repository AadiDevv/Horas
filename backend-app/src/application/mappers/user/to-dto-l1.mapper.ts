import {
    User,
    User_L1,
    UserEmployee_L1,
    UserManager_L1,
} from "@/domain/entities/user";
import {
    UserReadEmployeeDTO_L1,
    UserReadManagerDTO_L1,
    UserReadDTO_L1,
    UserAuthDTO,
} from "@/application/DTOS/";
import { } from "@/application/DTOS/team.dto";
import { UserMapper as UserMapperUtils } from "./utils.mapper";

export namespace UserMapper {
    
    export class FromEntityL1 {

        public static toReadUserDTO_L1(user: User_L1): UserReadDTO_L1 {
            const {hashedPassword, ...userData} = user;
            return {
                ...userData,
                ...user.dateToISOString()
            };
        }
        public static toReadUserAuthDTO_L1(user: User_L1): UserAuthDTO {
            const {hashedPassword, deletedAt, createdAt, updatedAt, ...userData} = user;
            return {
                ...userData,
            };
 
        }
   
        public static toReadDTO_L1(user: User): UserReadEmployeeDTO_L1 | UserReadManagerDTO_L1 {
            if (UserMapperUtils.isUserEmployee(user)) {
                return this.toEmployeeReadDTO_L1(user);
            }
            else if(UserMapperUtils.isUserManager(user)) {
                return this.toManagerReadDTO_L1(user);
            }else{
                throw new Error("Invalid user type");
            }
        }
        private static toEmployeeReadDTO_L1(employee: UserEmployee_L1): UserReadEmployeeDTO_L1 {
            const {hashedPassword, ...employeeData} = employee;
            return {
                ...employeeData,
                ...employee.dateToISOString()
            };
        }
        private static toManagerReadDTO_L1(manager: UserManager_L1): UserReadManagerDTO_L1 {
            const {hashedPassword, ...managerData} = manager;
            return {
                ...managerData,
                ...manager.dateToISOString()
            };
        }
 
    
    }
    
    
}