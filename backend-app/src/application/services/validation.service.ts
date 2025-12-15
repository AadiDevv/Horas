import { ValidationError } from "@/domain/error/AppError";

export class ValidateService{
    public static validatePassword(password: string): void {
        if(!password) throw new ValidationError("Password is required");
        if(password.length < 6) throw new ValidationError("Password must be at least 6 characters long");
        if(!password.match(/[a-z]/)) throw new ValidationError("Password must contain at least one lowercase letter");
        if(!password.match(/[A-Z]/)) throw new ValidationError("Password must contain at least one uppercase letter");
        if(!password.match(/[0-9]/)) throw new ValidationError("Password must contain at least one number");
        if(!password.match(/[!@#$%^&*]/)) throw new ValidationError("Password must contain at least one special character");
    }
}