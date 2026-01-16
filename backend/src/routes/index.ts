import { router } from "../trpc";
import { vehiclesRouter } from "./vehicles";

export const appRouter = router({
  vehicles: vehiclesRouter,
});

export type AppRouter = typeof appRouter;
