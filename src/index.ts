import ExpressApp from "./infrastructure/api/express-app";
import { appConfig } from "./config";

// TODO Figure out devdependencies and dependencies package.json
const expressApp = new ExpressApp(appConfig.express);

expressApp.start();
