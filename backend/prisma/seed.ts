import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // A seeded database is never seeded twice (the image runs this on every boot with SEED_DEMO=1).
  if ((await prisma.user.count()) > 0 && process.env.SEED_FORCE !== '1') {
    console.log('Seed skipped: the database already has users (SEED_FORCE=1 seeds anyway).');
    return;
  }

  // Create demo user
  // The demo password is this project's own (SEED_DEMO_PASSWORD in backend/.env, made at generation, never shipped):
  // no generated app shares a known password. Without it there are no demo accounts and no demo data.
  const demoPassword = process.env.SEED_DEMO_PASSWORD || '';
  if (!demoPassword) {
    console.warn('[seed] SEED_DEMO_PASSWORD is not set: no demo accounts and no demo data.');
    return;
  }
  const hashedPassword = await bcrypt.hash(demoPassword, 10);
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { isStaff: true },
    create: {
      isStaff: true,
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
    },
  });

  // Create demo staff user (staff, the same demo password)
  await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      username: 'staff',
      email: 'staff@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Staff',
      isStaff: true,
    },
  });

  // Domain seed data
  try {
    await prisma.category.create({ data: { name: 'Centrifuges', slug: 'centrifuges', description: 'Benchtop and floor-standing centrifuges for sample separation in clinical and research labs.' } });
    await prisma.category.create({ data: { name: 'Microscopes', slug: 'microscopes', description: 'Compound, stereo, and digital microscopes for diagnostic and educational laboratory use.' } });
    await prisma.category.create({ data: { name: 'PCR & Thermal Cyclers', slug: 'pcr-thermal-cyclers', description: 'Thermal cyclers and real-time PCR systems for molecular diagnostics and genomics research.' } });
    await prisma.category.create({ data: { name: 'Lab Safety Equipment', slug: 'lab-safety-equipment', description: 'Biosafety cabinets, fume hoods, and personal protective gear for safe laboratory operations.' } });
    await prisma.category.create({ data: { name: 'Glassware & Plasticware', slug: 'glassware-plasticware', description: 'Beakers, flasks, pipette tips, and consumable labware for everyday laboratory workflows.' } });
    await prisma.category.create({ data: { name: 'Incubators & Ovens', slug: 'incubators-ovens', description: 'CO2 incubators, drying ovens, and warming chambers for cell culture and sample prep.' } });
    await prisma.category.create({ data: { name: 'Spectrophotometers', slug: 'spectrophotometers', description: 'UV-Vis and fluorescence spectrophotometers for quantitative analysis of biological samples.' } });
    await prisma.category.create({ data: { name: 'Autoclaves & Sterilizers', slug: 'autoclaves-sterilizers', description: 'Steam autoclaves and dry heat sterilizers for decontaminating lab instruments and media.' } });
    await prisma.category.create({ data: { name: 'Refrigeration & Storage', slug: 'refrigeration-storage', description: 'Lab-grade refrigerators, freezers, and cryogenic storage units for reagents and samples.' } });
    await prisma.category.create({ data: { name: 'Diagnostic Analyzers', slug: 'diagnostic-analyzers', description: 'Hematology, chemistry, and immunoassay analyzers for clinical laboratory diagnostics.' } });
  } catch (e) { console.warn('[seed] Category skipped:', e); }
  try {
    await prisma.equipment.create({ data: { name: 'VelocitySpin 5420 Centrifuge', description: 'High-speed benchtop centrifuge with 24-place rotor, ideal for blood and serum separation.', sku: 'CF-5420-BT', price: 19.99, stockQuantity: 10, categoryId: 1, imageUrl: '/img/equipments/velocityspin-5420-centrifuge.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'ClarityView LED Compound Microscope', description: 'Binocular compound microscope with LED illumination and 1000x magnification for diagnostics.', sku: 'MS-1000X-LED', price: 29.99, stockQuantity: 20, categoryId: 2, imageUrl: '/img/equipments/clarityview-led-compound-microscope.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'GenomeCycle Pro Thermal Cycler', description: '96-well gradient thermal cycler with rapid ramp rates for precise PCR amplification.', sku: 'PCR-96GR-PRO', price: 39.99, stockQuantity: 30, categoryId: 3, imageUrl: '/img/equipments/genomecycle-pro-thermal-cycler.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'SafeAir Class II Biosafety Cabinet', description: 'Class II Type A2 biosafety cabinet providing HEPA-filtered protection for sample handling.', sku: 'BSC-A2-1200', price: 49.99, stockQuantity: 40, categoryId: 4, imageUrl: '/img/equipments/safeair-class-ii-biosafety-cabinet.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'BoroFlask 250mL Erlenmeyer Set', description: 'Set of ten borosilicate glass Erlenmeyer flasks, autoclavable and chemical resistant.', sku: 'GL-EF250-10', price: 59.99, stockQuantity: 50, categoryId: 5, imageUrl: '/img/equipments/boroflask-250ml-erlenmeyer-set.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'ThermoGrow CO2 Incubator', description: '170L CO2 incubator with precise humidity and temperature control for cell culture growth.', sku: 'INC-CO2-170L', price: 69.99, stockQuantity: 60, categoryId: 6, imageUrl: '/img/equipments/thermogrow-co2-incubator.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'SpectraLux UV-Vis Spectrophotometer', description: 'Double-beam UV-Vis spectrophotometer offering wavelength range of 190-1100nm for assays.', sku: 'SPEC-UV1100', price: 79.99, stockQuantity: 70, categoryId: 7, imageUrl: '/img/equipments/spectralux-uv-vis-spectrophotometer.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'SteriPro 75L Autoclave Sterilizer', description: 'Vertical pressure steam autoclave with digital controls for sterilizing lab instruments.', sku: 'AUTO-75L-VRT', price: 89.99, stockQuantity: 80, categoryId: 8, imageUrl: '/img/equipments/steripro-75l-autoclave-sterilizer.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'CryoSafe -86 Ultra Low Freezer', description: 'Upright ultra-low temperature freezer maintaining -86C for long-term sample preservation.', sku: 'FRZ-U86-500', price: 99.99, stockQuantity: 90, categoryId: 9, imageUrl: '/img/equipments/cryosafe-86-ultra-low-freezer.jpg', isActive: true } });
    await prisma.equipment.create({ data: { name: 'HemaCount Auto Hematology Analyzer', description: 'Fully automated hematology analyzer delivering 23-parameter CBC results in under a minute.', sku: 'HEM-23P-AUTO', price: 109.99, stockQuantity: 100, categoryId: 10, imageUrl: '/img/equipments/hemacount-auto-hematology-analyzer.jpg', isActive: true } });
  } catch (e) { console.warn('[seed] Equipment skipped:', e); }
  try {
    await prisma.cartItem.create({ data: { userId: 1, equipmentId: 1, quantity: 10 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 20 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 30 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 40 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 50 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 60 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 70 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 80 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 90 } });
    await prisma.cartItem.create({ data: { userId: 2, equipmentId: 2, quantity: 100 } });
  } catch (e) { console.warn('[seed] CartItem skipped:', e); }
  try {
    await prisma.order.create({ data: { userId: 1, totalAmount: 19.99, status: 'active', stripePaymentIntentId: '1', shippingAddress: '1420 Meadowbrook Lane, Suite 200, Austin, TX 78745', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 29.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '87 Parkview Terrace, Burlington, VT 05401', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 39.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '5590 Industrial Pkwy, Building C, Columbus, OH 43228', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 49.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '230 Lakeshore Drive, Suite 14, Madison, WI 53703', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 59.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '4021 Brookfield Avenue, San Diego, CA 92109', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 69.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '150 Greenway Plaza, Floor 3, Houston, TX 77046', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 79.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '982 Highland Road, Unit 5, Rochester, NY 14620', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 89.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '67 Wexford Street, Suite 101, Pittsburgh, PA 15213', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 99.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '3105 Oakmont Circle, Denver, CO 80209', paidAt: new Date() } });
    await prisma.order.create({ data: { userId: 2, totalAmount: 109.99, status: 'active', stripePaymentIntentId: '2', shippingAddress: '14 Cedarview Court, Portland, OR 97214', paidAt: new Date() } });
  } catch (e) { console.warn('[seed] Order skipped:', e); }
  try {
    await prisma.orderItem.create({ data: { orderId: 1, equipmentId: 1, quantity: 10, priceAtPurchase: 19.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 20, priceAtPurchase: 29.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 30, priceAtPurchase: 39.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 40, priceAtPurchase: 49.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 50, priceAtPurchase: 59.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 60, priceAtPurchase: 69.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 70, priceAtPurchase: 79.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 80, priceAtPurchase: 89.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 90, priceAtPurchase: 99.99 } });
    await prisma.orderItem.create({ data: { orderId: 2, equipmentId: 2, quantity: 100, priceAtPurchase: 109.99 } });
  } catch (e) { console.warn('[seed] OrderItem skipped:', e); }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
