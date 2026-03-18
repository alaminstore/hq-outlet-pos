import "dotenv/config";
import "reflect-metadata";
import { connectDB } from "./config/db-config";

type SeedOutlet = {
  outletCode: string;
  name: string;
  address: string;
};

const defaultOutlets: SeedOutlet[] = [
  {
    outletCode: "210001",
    name: "Gulshan 1 Branch",
    address: "House 12, Road 8, Gulshan 1, Dhaka 1212",
  },
  {
    outletCode: "210002",
    name: "Banani 11 Branch",
    address: "Plot 34, Road 11, Block H, Banani, Dhaka 1213",
  },
  {
    outletCode: "210003",
    name: "Dhanmondi Lake View Branch",
    address: "House 7/A, Road 27, Dhanmondi, Dhaka 1209",
  },
  {
    outletCode: "210004",
    name: "Uttara Sector 7 Branch",
    address: "House 21, Road 9, Sector 7, Uttara, Dhaka 1230",
  },
  {
    outletCode: "210005",
    name: "Mirpur 10 Branch",
    address: "Shop 15, Mirpur 10 Roundabout, Dhaka 1216",
  },
  {
    outletCode: "210006",
    name: "Motijheel Commercial Branch",
    address: "79/A Motijheel Commercial Area, Dhaka 1000",
  },
  {
    outletCode: "210007",
    name: "Bashundhara Gate Branch",
    address: "House 5, Block C, Bashundhara Residential Area, Dhaka 1229",
  },
  {
    outletCode: "210008",
    name: "Mohammadpur Town Hall Branch",
    address: "15 Satmasjid Road, Mohammadpur, Dhaka 1207",
  },
  {
    outletCode: "210009",
    name: "Farmgate Corner Branch",
    address: "88 Indira Road, Farmgate, Dhaka 1215",
  },
  {
    outletCode: "210010",
    name: "Wari Rankin Street Branch",
    address: "43 Rankin Street, Wari, Dhaka 1203",
  },
];

export async function seedOutlets() {
  const valuesSql = defaultOutlets
    .map((_, index) => {
      const offset = index * 3;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
    })
    .join(", ");

  await connectDB.query(
    `INSERT INTO outlets (outlet_code, name, address)
     VALUES ${valuesSql}
     ON CONFLICT (outlet_code) DO NOTHING`,
    defaultOutlets.flatMap((outlet) => [
      outlet.outletCode,
      outlet.name,
      outlet.address,
    ]),
  );
}

export async function runSeed() {
  const ownsConnection = !connectDB.isInitialized;

  try {
    if (ownsConnection) {
      await connectDB.initialize();
      console.log("[HQ OUTLET POS][SEED] connected");
    }

    await seedOutlets();
    console.log("[HQ OUTLET POS][SEED] outlets seeded");
  } catch (error) {
    console.error("[HQ OUTLET POS][SEED] failed", error);
    process.exitCode = 1;
  } finally {
    if (ownsConnection && connectDB.isInitialized) {
      await connectDB.destroy();
    }
  }
}

if (require.main === module) {
  void runSeed();
}
