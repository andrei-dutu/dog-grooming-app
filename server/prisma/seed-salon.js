import "dotenv/config";
import { prisma, pool } from "../src/db/prisma.js";

const salonData = {
  name: "PawBook Grooming",
  description: "Professional dog grooming salon",
  about_story: "We love dogs and have been grooming the community's pets since 2020.",
  location_address: "Str. Exemplu 10, București",
  location_map_url: "https://maps.google.com/?q=PawBook+Grooming",
  contact_email: "hello@pawbook.example",
  contact_phone: "+40 700 000 000",
};

// Schema: salon_info_id este @unique → un singur rând program per salon (1:1)
const openingHoursData = {
  day_of_week: 1,
  is_closed: false,
  open_time: "09:00",
  close_time: "18:00",
};

async function main() {
  const existing = await prisma.salonInfo.findFirst();
  if (existing) {
    console.log("Salon already seeded:", existing.id, existing.name);
    await pool.end();
    return;
  }

  const salon = await prisma.salonInfo.create({ data: salonData });
  console.log("Created SalonInfo:", salon.id, salon.name);

  const hours = await prisma.salonOpeningHours.create({
    data: { salon_info_id: salon.id, ...openingHoursData },
  });
  console.log("Created SalonOpeningHours:", hours.id);

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
