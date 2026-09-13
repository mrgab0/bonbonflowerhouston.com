import dbConnect from "../lib/db";
import { SiteConfig } from "../lib/models/SiteConfig";

async function run() {
  await dbConnect();
  console.log("Conectado a MongoDB Atlas.");

  const result = await SiteConfig.updateMany(
    { key: "global" },
    {
      $set: {
        heroTitle: "Bonbon Flowers Houston",
        heroSlogan: "Arreglos florales exclusivos y detalles de lujo diseñados para sorprender a quien más amas.",
        footerTitle: "Bonbon Flowers Houston",
        footerSlogan: "Boutique Digital de Alta Floristería • Houston, Texas",
        footerCopyright: "© 2026 Bonbon Flowers Houston. Todos los derechos reservados.",
        logoUrl: "https://bonbonflowershouston.com/logo.png",
        brandSlogan: "Boutique Floral Digital • Houston, Texas",
        facebookUrl: "https://www.facebook.com/bonbon.flowers.2025",
        instagramUrl: "https://www.instagram.com/bonbonflowers__?stkn=MXBnc3hsbHVlM3psMQ==",
        socialFeedTitle: "Síguenos en Instagram @bonbonflowers__ 📸",
        dialogflowChatTitle: "Bonbon Flowers Virtual Assistant 🌸",
        seoTitle: "Bonbon Flowers Houston | Boutique Digital de Alta Floristería",
        seoDescription: "Floristería exclusiva con arreglos florales de lujo, rosas y detalles personalizados a domicilio con entrega express en Houston, TX.",
        seoKeywords: "floristeria, flores a domicilio, arreglos florales, rosas, ramos de flores, regalos, houston tx, bonbon flowers",
        ogImage: "https://bonbonflowershouston.com/logo.png",
        businessName: "Bonbon Flowers",
        businessAddress: "Houston, TX",
        businessCity: "Houston, TX",
        updatedAt: new Date(),
      }
    },
    { upsert: true }
  );

  console.log("UPDATE COMPLETED SUCCESSFULLY:", result);

  const updatedDoc = await SiteConfig.findOne({ key: "global" }).lean();
  console.log("CURRENT SITECONFIG IN DB:", JSON.stringify(updatedDoc, null, 2));

  process.exit(0);
}

run().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
