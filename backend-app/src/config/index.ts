import { controllers } from "./controller.factory";
import { app } from "./usecase.factory";
import { infra } from "./repository.factory"

export { infra, app, controllers };


export const initializeApp = ():void => {
    infra.initDb();
    controllers.AuthController()
};

export const shutdownApp = async (): Promise<void> => {
    controllers.reset();
    app.reset();
    await infra.disconnect();
};
