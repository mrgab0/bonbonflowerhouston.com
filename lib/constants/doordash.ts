import { IDoorDashConfig } from "@/lib/models/SiteConfig";

export const DEFAULT_DOORDASH_CONFIG: IDoorDashConfig = {
  verificationFileName: "",
  verificationFileContent: "",
  scriptHtml: "",
  scriptEnabled: false,
  developerId: "",
  keyId: "",
  signingSecret: "",
  storeId: "",
  pickupInstructions: "Recoger arreglo floral en el mostrador. Manipular en posición vertical dentro del vehículo.",
  leadTimeMinutes: 30,
  environment: "production",
  autoDispatchEnabled: false,
};
