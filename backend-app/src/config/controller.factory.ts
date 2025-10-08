import { AuthController } from "@/presentation/controllers";
import { app } from "./usecase.factory";
class ControllerFactory {
    private static authController : AuthController | null;

    public static getAuthController():AuthController{
        if(!this.authController){
            const usecase = app.getAuthUseCase();
            this.authController = new AuthController(usecase);
        }
        return this.authController
    }

    public static reset():void{
        this.authController = null;
    }

}

export const controllers = {
    AuthController : ()=>(ControllerFactory.getAuthController()),
    reset: ()=>(ControllerFactory.reset())
}