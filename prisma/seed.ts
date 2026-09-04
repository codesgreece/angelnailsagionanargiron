import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedService = {
  name: string;
  slug: string;
  description?: string;
  price?: number | null;
  priceFrom?: boolean;
  durationMin?: number;
  durationMax?: number;
  durationLabel?: string;
  featured?: boolean;
  displayOrder?: number;
  pendingData?: boolean;
};

async function upsertCategory(
  name: string,
  slug: string,
  filterGroup: string,
  displayOrder: number,
  description?: string,
) {
  return prisma.serviceCategory.upsert({
    where: { slug },
    update: { name, filterGroup, displayOrder, description, active: true },
    create: { name, slug, filterGroup, displayOrder, description, active: true },
  });
}

async function upsertServices(categoryId: string, services: SeedService[]) {
  for (const [index, s] of services.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        categoryId,
        description: s.description,
        price: s.price === null || s.price === undefined ? null : new Prisma.Decimal(s.price),
        priceFrom: s.priceFrom ?? false,
        durationMin: s.durationMin,
        durationMax: s.durationMax,
        durationLabel: s.durationLabel,
        featured: s.featured ?? false,
        active: !s.pendingData,
        pendingData: s.pendingData ?? false,
        displayOrder: s.displayOrder ?? index,
      },
      create: {
        name: s.name,
        slug: s.slug,
        categoryId,
        description: s.description,
        price: s.price === null || s.price === undefined ? null : new Prisma.Decimal(s.price),
        priceFrom: s.priceFrom ?? false,
        durationMin: s.durationMin,
        durationMax: s.durationMax,
        durationLabel: s.durationLabel,
        featured: s.featured ?? false,
        active: !s.pendingData,
        pendingData: s.pendingData ?? false,
        displayOrder: s.displayOrder ?? index,
      },
    });
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@angelnails.gr";
  const password = process.env.ADMIN_PASSWORD || "AngelNails2026!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: "Angel Nails Admin", active: true },
    create: { email, name: "Angel Nails Admin", passwordHash, role: "admin" },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brandName: "Angel Nails",
      tagline: "ΜΑΝΙΚΙΟΥΡ • ΠΕΝΤΙΚΙΟΥΡ • ΤΕΧΝΗΤΑ ΝΥΧΙΑ",
      phonePrimary: "2102625122",
      phoneSecondary: "6948384776",
      email: "angelnails.ag@gmail.com",
      addressLine1: "Ηρώων Πολυτεχνείου 25",
      addressLine2: "Άγιοι Ανάργυροι",
      city: "Άγιοι Ανάργυροι",
      region: "Αττική",
      postalCode: "13561",
      country: "Greece",
      treatwellUrl: "https://www.treatwell.gr/katasthma/angel-nails-16/",
      heroImageUrl: "/images/store/venue-1.png",
      logoUrl: null,
      latitude: 38.02831846,
      longitude: 23.71743857,
    },
  });

  await prisma.seoSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteTitle: "Angel Nails | Μανικιούρ & Πεντικιούρ στους Αγίους Αναργύρους",
      metaDescription:
        "Angel Nails στους Αγίους Αναργύρους. Μανικιούρ, πεντικιούρ, ημιμόνιμο, τεχνητά νύχια, nail care και υπηρεσίες ομορφιάς.",
      keywords:
        "Angel Nails, μανικιούρ, πεντικιούρ, Άγιοι Ανάργυροι, τεχνητά νύχια, ημιμόνιμο, nail salon",
      ogImageUrl: "/images/store/venue-1.png",
      canonicalBase: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  });

  const pages = [
    {
      key: "home.hero",
      title: "Angel Nails",
      subtitle: "Η περιποίηση των άκρων, στη δική μας αισθητική.",
      body: "Μανικιούρ • Πεντικιούρ • Τεχνητά Νύχια • Nail Care",
      ctaLabel: "Κλείσε Ραντεβού",
      ctaHref: "treatwell",
      imageUrl: "/images/store/venue-1.png",
    },
    {
      key: "home.intro",
      title: "Σύγχρονο nail studio στους Αγίους Αναργύρους",
      subtitle: "Λεπτομέρεια. Αισθητική. Φροντίδα.",
      body: "Ένας σύγχρονος χώρος ομορφιάς και περιποίησης αφιερωμένος στη λεπτομέρεια, την αισθητική και τη φροντίδα κάθε επισκέπτη. Στο Angel Nails προσφέρουμε μανικιούρ, πεντικιούρ, ημιμόνιμο, τεχνητά νύχια, nail care, nail design, καθώς και υπηρεσίες αποτρίχωσης με κλωστή και κερί.",
    },
    {
      key: "home.services",
      title: "Οι υπηρεσίες μας",
      subtitle: "Επιλεγμένες θεραπείες για χέρια, πόδια και nail design.",
    },
    {
      key: "about",
      title: "Σχετικά με το Angel Nails",
      subtitle: "Ο χώρος και η εμπειρία",
      body: "Το Angel Nails στους Αγίους Αναργύρους είναι ένας σύγχρονος χώρος ομορφιάς και περιποίησης που προσφέρει ολοκληρωμένες υπηρεσίες αισθητικής με έμφαση στη φροντίδα των άκρων. Εξειδικεύεται σε μανικιούρ, πεντικιούρ, ημιμόνιμη βαφή, τεχνητά νύχια και nail designs, ενώ παράλληλα παρέχει υπηρεσίες αποτρίχωσης.\n\nΜε έμφαση στη λεπτομέρεια και ένα ζεστό, φιλικό περιβάλλον, το Angel Nails προσφέρει μια ολοκληρωμένη εμπειρία περιποίησης για κάθε επισκέπτη.",
      imageUrl: "/images/store/venue-1.png",
    },
    {
      key: "contact",
      title: "Επικοινωνία",
      subtitle: "Πώς θα μας βρείτε",
      body: "Βρισκόμαστε στους Αγίους Αναργύρους, στην Ηρώων Πολυτεχνείου 25. Κλείστε ραντεβού μέσω Treatwell ή επικοινωνήστε μαζί μας τηλεφωνικά.",
    },
    {
      key: "footer",
      title: "Angel Nails",
      body: "Premium nail & beauty studio στους Αγίους Αναργύρους.",
    },
  ];

  for (const p of pages) {
    await prisma.pageContent.upsert({
      where: { key: p.key },
      update: p,
      create: p,
    });
  }

  const hours = [
    { dayOfWeek: 1, dayNameEl: "Δευτέρα", closed: true },
    { dayOfWeek: 2, dayNameEl: "Τρίτη", openTime: "09:00", closeTime: "21:00", closed: false },
    { dayOfWeek: 3, dayNameEl: "Τετάρτη", openTime: "09:00", closeTime: "21:00", closed: false },
    { dayOfWeek: 4, dayNameEl: "Πέμπτη", openTime: "09:00", closeTime: "21:00", closed: false },
    { dayOfWeek: 5, dayNameEl: "Παρασκευή", openTime: "09:00", closeTime: "21:00", closed: false },
    { dayOfWeek: 6, dayNameEl: "Σάββατο", openTime: "09:00", closeTime: "17:00", closed: false },
    { dayOfWeek: 0, dayNameEl: "Κυριακή", closed: true },
  ];

  for (const h of hours) {
    await prisma.openingHour.upsert({
      where: { dayOfWeek: h.dayOfWeek },
      update: h,
      create: h,
    });
  }

  const team = [
    { name: "Χριστίνα", role: "Nail Artist", services: "Νύχια, Πρόσωπο, Αποτρίχωση", displayOrder: 0 },
    { name: "Μαρία", role: "Nail Artist", services: "Νύχια", displayOrder: 1 },
    { name: "Βίκυ", role: "Nail Artist", services: "Νύχια, Πρόσωπο, Αποτρίχωση", displayOrder: 2 },
  ];

  for (const m of team) {
    const existing = await prisma.teamMember.findFirst({ where: { name: m.name } });
    if (existing) {
      await prisma.teamMember.update({ where: { id: existing.id }, data: { ...m, active: true } });
    } else {
      await prisma.teamMember.create({ data: { ...m, active: true } });
    }
  }

  // Categories & services from Treatwell (real data only)
  const manicure = await upsertCategory(
    "Μανικιούρ",
    "manikioyr",
    "Μανικιούρ",
    1,
    "Μανικιούρ & περιποίηση χεριών",
  );
  const pedicure = await upsertCategory(
    "Πεντικιούρ",
    "pentikioyr",
    "Πεντικιούρ",
    2,
    "Πεντικιούρ & περιποίηση ποδιών",
  );
  const removal = await upsertCategory("Αφαίρεση", "afairesi", "Nail Extras", 3);
  const artificial = await upsertCategory(
    "Τεχνητά Νύχια",
    "technita-nychia",
    "Τεχνητά Νύχια",
    4,
  );
  const threadFace = await upsertCategory(
    "Αποτρίχωση με Κλωστή Προσώπου",
    "apotrixosi-klosti-prosopou",
    "Αποτρίχωση",
    5,
  );
  const threadBrows = await upsertCategory(
    "Αποτρίχωση με Κλωστή - Φρύδια",
    "apotrixosi-klosti-frydia",
    "Αποτρίχωση",
    6,
  );
  const waxWomen = await upsertCategory(
    "Αποτρίχωση με Κερί Γυναίκες",
    "apotrixosi-keri-gynaikes",
    "Αποτρίχωση",
    7,
  );
  const waxMen = await upsertCategory(
    "Αποτρίχωση με Κερί Άντρες",
    "apotrixosi-keri-antres",
    "Αποτρίχωση",
    8,
  );
  const extras = await upsertCategory("Nail Extras", "nail-extras", "Nail Extras", 9);

  await upsertServices(manicure.id, [
    {
      name: "Μανικιούρ Χωρίς Βάψιμο",
      slug: "manikioyr-xoris-vapsimo",
      description: "Πετσάκια, λιμάρισμα.",
      price: 15,
      durationMin: 45,
      durationLabel: "45 λεπτά",
      featured: true,
    },
    {
      name: "Μανικιούρ Απλό Μανό",
      slug: "manikioyr-aplo-mano",
      price: 20,
      durationMin: 60,
      durationLabel: "1 ώρα",
      featured: true,
    },
    {
      name: "Μανικιούρ Ημιμόνιμο",
      slug: "manikioyr-imimonimo",
      price: 23,
      durationMin: 60,
      durationLabel: "1 ώρα",
      featured: true,
    },
    {
      name: "Μανικιούρ Ενισχυμένη Βάση",
      slug: "manikioyr-enischymeni-vasi",
      price: 25,
      durationMin: 60,
      durationLabel: "1 ώρα",
      featured: true,
    },
  ]);

  await upsertServices(pedicure.id, [
    {
      name: "Πεντικιούρ χωρίς Βάψιμο",
      slug: "pentikioyr-xoris-vapsimo",
      price: 18,
      durationMin: 45,
      durationLabel: "45 λεπτά",
      featured: true,
    },
    {
      name: "Πεντικιούρ Απλό Μανό",
      slug: "pentikioyr-aplo-mano",
      price: 20,
      durationMin: 75,
      durationLabel: "1 ώρα 15 λεπτά",
    },
    {
      name: "Πεντικιούρ Ημιμόνιμο",
      slug: "pentikioyr-imimonimo",
      price: 23,
      durationMin: 75,
      durationLabel: "1 ώρα 15 λεπτά",
      featured: true,
    },
    {
      name: "Πεντικιούρ Θεραπευτικό",
      slug: "pentikioyr-therapeutiko",
      price: 25,
      durationMin: 75,
      durationLabel: "1 ώρα 15 λεπτά",
    },
    {
      name: "Πεντικιούρ Αντρικό",
      slug: "pentikioyr-antriko",
      price: 15,
      durationMin: 60,
      durationLabel: "1 ώρα",
    },
  ]);

  await upsertServices(removal.id, [
    {
      name: "Αφαίρεση Ημιμόνιμου",
      slug: "afairesi-imimonimou",
      description: "Αφαίρεση ημιμόνιμου και σχήμα.",
      price: 5,
      durationMin: 20,
      durationLabel: "20 λεπτά",
    },
  ]);

  await upsertServices(artificial.id, [
    {
      name: "Επιμήκυνση με Ακρυλικό",
      slug: "epimikynsi-akryliko",
      price: 35,
      priceFrom: true,
      durationMin: 120,
      durationMax: 165,
      durationLabel: "2 ώρες – 2 ώρες 45 λεπτά",
    },
    {
      name: "Επιμήκυνση με Acrygel",
      slug: "epimikynsi-acrygel",
      price: 40,
      priceFrom: true,
      durationMin: 150,
      durationMax: 180,
      durationLabel: "2 ώρες 30 λεπτά – 3 ώρες",
    },
    {
      name: "Συντήρηση με Acrygel",
      slug: "syntirisi-acrygel",
      price: 30,
      priceFrom: true,
      durationMin: 90,
      durationMax: 105,
      durationLabel: "1 ώρα 30 λεπτά – 1 ώρα 45 λεπτά",
    },
    {
      name: "Συντήρηση με Ακρυλικό",
      slug: "syntirisi-akryliko",
      price: 35,
      priceFrom: true,
      durationMin: 105,
      durationMax: 120,
      durationLabel: "1 ώρα 45 λεπτά – 2 ώρες",
    },
    {
      name: "Φυσική Ενίσχυση",
      slug: "fysiki-enischysi",
      price: 30,
      durationMin: 90,
      durationLabel: "1 ώρα 30 λεπτά",
    },
    {
      name: "Αφαίρεση Acrygel & Τοποθέτηση",
      slug: "afairesi-acrygel-topothetisi",
      price: 45,
      durationMin: 150,
      durationLabel: "2 ώρες 30 λεπτά",
    },
    {
      name: "Αφαίρεση Τεχνητών Νυχιών",
      slug: "afairesi-techniton-nychion",
      price: 10,
      durationMin: 30,
      durationLabel: "30 λεπτά",
    },
    {
      name: "Διόρθωση καθοδηκότητας νυχιών και σχήματος",
      slug: "diorthosi-kathodigikotitas",
      price: 5,
      durationMin: 30,
      durationLabel: "30 λεπτά",
    },
  ]);

  await upsertServices(threadBrows.id, [
    {
      name: "Καθαρισμός Φρυδιών",
      slug: "katharismos-frydion",
      price: 5,
      durationMin: 15,
      durationLabel: "15 λεπτά",
    },
    {
      name: "Σχηματισμός Φρυδιών",
      slug: "schimatismos-frydion",
      price: 10,
      durationMin: 20,
      durationLabel: "20 λεπτά",
    },
  ]);

  await upsertServices(threadFace.id, [
    {
      name: "Αποτρίχωση με Κλωστή Πρόσωπο",
      slug: "apotrixosi-klosti-prosopo",
      price: 3,
      priceFrom: true,
      durationMin: 5,
      durationMax: 30,
      durationLabel: "5 – 30 λεπτά",
    },
  ]);

  await upsertServices(waxWomen.id, [
    {
      name: "Αποτρίχωση με Κερί για Γυναίκες - Πόδι",
      slug: "keri-gynaikes-podi",
      price: 15,
      priceFrom: true,
      durationMin: 20,
      durationMax: 45,
      durationLabel: "20 – 45 λεπτά",
    },
    {
      name: "Αποτρίχωση με Κερί για Γυναίκες - Μασχάλες",
      slug: "keri-gynaikes-maschales",
      price: 10,
      durationMin: 15,
      durationLabel: "15 λεπτά",
    },
    {
      name: "Αποτρίχωση με Κερί για Γυναίκες - Χέρι",
      slug: "keri-gynaikes-cheri",
      price: 10,
      priceFrom: true,
      durationMin: 15,
      durationMax: 20,
      durationLabel: "15 – 20 λεπτά",
    },
    {
      name: "Αποτρίχωση με Κερί Κοιλιά",
      slug: "keri-koilia",
      price: 15,
      durationMin: 30,
      durationLabel: "30 λεπτά",
    },
    {
      name: "Αποτρίχωση με Κερί Μέση",
      slug: "keri-mesi",
      price: 10,
      durationMin: 20,
      durationLabel: "20 λεπτά",
    },
  ]);

  await upsertServices(waxMen.id, [
    {
      name: "Αποτρίχωση με Κερί για Άντρες - Πλάτη & Ώμοι",
      slug: "keri-antres-plati-omoi",
      price: 25,
      durationMin: 45,
      durationLabel: "45 λεπτά",
    },
    {
      name: "Αποτρίχωση με Κερί για Άντρες - Στήθος",
      slug: "keri-antres-stithos",
      price: 15,
      durationMin: 20,
      durationLabel: "20 λεπτά",
    },
    {
      name: "Αποτρίχωση με Κερί για Άντρες - Κοιλιά",
      slug: "keri-antres-koilia",
      price: 15,
      durationMin: 15,
      durationLabel: "15 λεπτά",
    },
    {
      name: "Αποτρίχωση με Κερί για Άντρες Χέρια",
      slug: "keri-antres-cheria",
      price: 20,
      durationMin: 40,
      durationLabel: "40 λεπτά",
    },
    {
      name: "Αποτρίχωση με Κερί για Άντρες Πόδια Μισά",
      slug: "keri-antres-podia-misa",
      price: 15,
      durationMin: 30,
      durationLabel: "30 λεπτά",
    },
  ]);

  await upsertServices(extras.id, [
    {
      name: "Διόρθωση Νυχιού",
      slug: "diorthosi-nychiou",
      price: 3,
      durationMin: 15,
      durationLabel: "15 λεπτά",
    },
    {
      name: "Nail Art",
      slug: "nail-art",
      price: 1,
      priceFrom: true,
      durationMin: 10,
      durationLabel: "10 λεπτά",
    },
    {
      name: "Μεγάλα Σχέδια (3D)",
      slug: "megala-schedia-3d",
      price: 3,
      priceFrom: true,
      durationMin: 15,
      durationLabel: "15 λεπτά",
    },
  ]);

  const gallery = [
    {
      title: "Angel Nails storefront",
      category: "Χώρος",
      altText: "Ταμπέλα Angel Nails στους Αγίους Αναργύρους",
      imageUrl: "/images/store/venue-1.png",
      featured: true,
      displayOrder: 0,
    },
    {
      title: "Χώρος Angel Nails",
      category: "Χώρος",
      altText: "Εσωτερικός χώρος Angel Nails",
      imageUrl: "/images/store/venue-2.jpg",
      featured: true,
      displayOrder: 1,
    },
    {
      title: "Studio λεπτομέρεια",
      category: "Χώρος",
      altText: "Λεπτομέρεια από τον χώρο του Angel Nails",
      imageUrl: "/images/store/venue-3.jpg",
      featured: false,
      displayOrder: 2,
    },
    {
      title: "Nail studio",
      category: "Νύχια",
      altText: "Nail studio Angel Nails",
      imageUrl: "/images/store/venue-4.jpg",
      featured: true,
      displayOrder: 3,
    },
  ];

  for (const g of gallery) {
    const existing = await prisma.galleryImage.findFirst({ where: { imageUrl: g.imageUrl } });
    const lookbookData = {
      lookbookEnabled: true,
      lookbookOrder: g.displayOrder,
      lookbookTitle: g.title,
      lookbookCategory: g.category,
      lookbookFeatured: g.featured,
      lookbookDescription: "Angel Nails lookbook",
    };
    if (existing) {
      await prisma.galleryImage.update({
        where: { id: existing.id },
        data: { ...g, ...lookbookData, active: true },
      });
    } else {
      await prisma.galleryImage.create({ data: { ...g, ...lookbookData, active: true } });
    }
  }

  await prisma.lookbookSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title: "THE ANGEL NAILS BOOK",
      subtitle: "NAIL LOOKS • DETAILS • INSPIRATION",
      coverImageUrl: "/images/store/venue-1.png",
      homepageEnabled: true,
      homepageBlurb: "Μια ματιά στα looks που δημιουργούμε.",
    },
  });

  const legal = [
    {
      slug: "privacy-policy",
      title: "Πολιτική Απορρήτου",
      content: `## Πολιτική Απορρήτου\n\nΤο Angel Nails σέβεται τα προσωπικά σας δεδομένα.\n\nΣυλλέγουμε μόνο τα απαραίτητα στοιχεία επικοινωνίας όταν επικοινωνείτε μαζί μας (τηλέφωνο, email). Τα ραντεβού πραγματοποιούνται μέσω της πλατφόρμας Treatwell και υπόκεινται στους όρους της.\n\nΓια ερωτήσεις σχετικά με τα δεδομένα σας: angelnails.ag@gmail.com\n\nΔιεύθυνση: Ηρώων Πολυτεχνείου 25, Άγιοι Ανάργυροι, 13561.`,
    },
    {
      slug: "privacy",
      title: "Απόρρητο",
      content: `## Απόρρητο\n\nΗ παρούσα σελίδα συνοψίζει την πολιτική απορρήτου του Angel Nails. Τα ραντεβού και τα σχετικά δεδομένα πελατών διαχειρίζονται μέσω Treatwell.\n\nΕπικοινωνία: angelnails.ag@gmail.com`,
    },
    {
      slug: "terms",
      title: "Όροι Χρήσης",
      content: `## Όροι Χρήσης\n\nΗ χρήση του ιστότοπου Angel Nails υπόκειται στους παρόντες όρους.\n\nΟι πληροφορίες υπηρεσιών και τιμών ενδέχεται να ενημερώνονται. Το κλείσιμο ραντεβού γίνεται αποκλειστικά μέσω Treatwell.\n\nAngel Nails — Ηρώων Πολυτεχνείου 25, Άγιοι Ανάργυροι.`,
    },
    {
      slug: "cookies",
      title: "Πολιτική Cookies",
      content: `## Πολιτική Cookies\n\nΟ ιστότοπος χρησιμοποιεί απαραίτητα cookies για τη λειτουργία του (π.χ. σύνδεση διαχειριστή).\n\nΠροαιρετικά analytics ενεργοποιούνται μόνο εφόσον ρυθμιστούν από τον διαχειριστή και μετά από συγκατάθεση.\n\nΜπορείτε να διαχειριστείτε τις προτιμήσεις σας από το banner cookies.`,
    },
  ];

  for (const l of legal) {
    await prisma.legalPage.upsert({
      where: { slug: l.slug },
      update: l,
      create: l,
    });
  }

  const pageSeos = [
    { path: "/", title: null, description: null },
    {
      path: "/services",
      title: "Υπηρεσίες | Angel Nails",
      description: "Μανικιούρ, πεντικιούρ, τεχνητά νύχια και αποτρίχωση στο Angel Nails, Άγιοι Ανάργυροι.",
    },
    {
      path: "/gallery",
      title: "Gallery | Angel Nails",
      description: "Φωτογραφίες από τον χώρο και τις δημιουργίες του Angel Nails.",
    },
    {
      path: "/about",
      title: "Σχετικά | Angel Nails",
      description: "Γνωρίστε το Angel Nails στους Αγίους Αναργύρους.",
    },
    {
      path: "/contact",
      title: "Επικοινωνία | Angel Nails",
      description: "Διεύθυνση, τηλέφωνα και χάρτης για το Angel Nails.",
    },
  ];

  for (const ps of pageSeos) {
    await prisma.pageSeo.upsert({
      where: { path: ps.path },
      update: ps,
      create: ps,
    });
  }

  console.log("Seed completed.");
  console.log(`Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
