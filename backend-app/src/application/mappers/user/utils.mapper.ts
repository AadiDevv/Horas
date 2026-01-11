import { UserEmployee_Core, UserManager_Core } from "@/domain/entities/user";

export namespace UserMapper {
    export function isUserEmployee(user: UserEmployee_Core | UserManager_Core): user is UserEmployee_Core {
    return user.role === "employe";
    }

    export function isUserManager(user: UserEmployee_Core | UserManager_Core): user is UserManager_Core {
        return user.role === "manager";
    }
}