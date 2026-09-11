import { db, departments } from "./index";

const deptData = [
  { name: "24hr Outpatient & Inpatient", slug: "outpatient_inpatient",  isOpen24hrs: true,  floor: "Ground Floor" },
  { name: "Accident & Emergency",        slug: "accident_emergency",     isOpen24hrs: true,  floor: "Ground Floor" },
  { name: "Specialist Clinics",          slug: "specialist_clinics",     isOpen24hrs: false, floor: "1st Floor" },
  { name: "Laboratory",                  slug: "laboratory",             isOpen24hrs: false, floor: "Ground Floor" },
  { name: "Pharmacy",                    slug: "pharmacy",               isOpen24hrs: false, floor: "Ground Floor" },
  { name: "Radiology & X-Ray",           slug: "radiology",              isOpen24hrs: false, floor: "Ground Floor" },
  { name: "Physiotherapy",               slug: "physiotherapy",          isOpen24hrs: false, floor: "1st Floor" },
  { name: "Dental Unit",                 slug: "dental",                 isOpen24hrs: false, floor: "1st Floor" },
  { name: "Maternity",                   slug: "maternity",              isOpen24hrs: true,  floor: "2nd Floor" },
  { name: "Eye Care Clinic",             slug: "eye_care",               isOpen24hrs: false, floor: "1st Floor" },
  { name: "Mother & Child Health",       slug: "mother_child_health",    isOpen24hrs: false, floor: "2nd Floor" },
  { name: "Critical Care Unit (ICU/HDU)","slug": "critical_care_icu",   isOpen24hrs: true,  floor: "3rd Floor" },
] as const;

async function seed() {
  console.log("Seeding departments...");
  await db.insert(departments).values(
    deptData.map(d => ({
      name:        d.name,
      slug:        d.slug,
      isOpen24hrs: d.isOpen24hrs,
      floor:       d.floor,
    }))
  ).onConflictDoNothing();
  console.log("Done — 12 departments seeded.");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});