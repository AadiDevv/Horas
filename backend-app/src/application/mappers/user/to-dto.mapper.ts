import {
    User,
    UserEmployee,
    UserManager,
} from "@/domain/entities/user";
import {
    UserReadEmployeeDTO,
    UserReadManagerDTO,

} from "@/application/DTOS/";
import { } from "@/application/DTOS/team.dto";
import { UserMapper as UserMapperUtils } from "./utils.mapper";

export namespace UserMapper {

    export class FromEntity {

        public static toReadDTO(user: User): UserReadEmployeeDTO | UserReadManagerDTO {
            if (UserMapperUtils.isUserEmployee(user)) {
                return this.toEmployeeReadDTO(user);
            }else if(UserMapperUtils.isUserManager(user)) {
                return this.toManagerReadDTO(user);
            }else{
                throw new Error("Invalid user type");
            }
        }
        
        private static toEmployeeReadDTO(employee: UserEmployee): UserReadEmployeeDTO {
            return {
                ...employee,
                ...employee.dateToISOString()
            };
        }
        
        private static toManagerReadDTO(manager: UserManager): UserReadManagerDTO {
            const { hashedPassword, ...managerData } = manager;
            return {
                ...managerData,
                ...manager.dateToISOString(),
                employes: manager.employes?.map(emp => ({
                    id: emp.id,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                })) ?? [],
            } as unknown as UserReadManagerDTO;
        }
    
      
    }
    
}
    
