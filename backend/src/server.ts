import "dotenv/config";
import "reflect-metadata";
import { createApp } from "./app";
import { connectDB } from "./config/db-config";

const port = Number(process.env.PORT ?? 4000);

async function StartPOS() {
  try {
    await connectDB.initialize();
    console.log("[HQ OUTLET POS][DB] connected");

    const app = createApp();
    app.listen(port, () => {
      console.log(`[HQ OUTLET POS][API] listening on port ${port}`);
    });
  } catch (error) {
    console.error("[HQ OUTLET POS][DB] failed to connect", error);
    process.exit(1);
  }
}

StartPOS();
