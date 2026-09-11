import dbConnect from "../lib/db";
import { SiteConfig } from "../lib/models/SiteConfig";

async function run() {
  await dbConnect();
  console.log("Conectado a MongoDB Atlas.");

  const result = await SiteConfig.updateMany(
    { key: "global" },
    {
      $set: {
        heroTitle: "Gabriela's Flowers LLC",
        footerTitle: "Gabriela's Flowers LLC",
        footerCopyright: "© 2026 Gabriela's Flowers LLC. Todos los derechos reservados.",
        socialFeedTitle: "Síguenos en Instagram @GabrielasFlowers 📸"
      }
    }
  );

  console.log("UPDATE COMPLETED SUCCESSFULLY:", result);
  process.exit(0);
}

run().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
