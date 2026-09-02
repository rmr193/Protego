import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with natural citizen & police records...');

  // 1. Create Roles
  const citizenRole = await prisma.role.upsert({
    where: { name: 'CITIZEN' },
    update: {},
    create: {
      name: 'CITIZEN',
      description: 'Standard citizen user',
    },
  });

  const policeRole = await prisma.role.upsert({
    where: { name: 'POLICE_OFFICER' },
    update: {},
    create: {
      name: 'POLICE_OFFICER',
      description: 'Law enforcement officer',
    },
  });

  // 2. Police Stations
  const maijdeeStation = await prisma.policeStation.upsert({
    where: { station_id: 'station-maijdee-01' },
    update: {},
    create: {
      station_id: 'station-maijdee-01',
      station_name: 'Maijdee Central Police HQ',
      location: 'Maijdee Court Road, Noakhali (22.8717° N, 91.0879° E)',
      contact_number: '+8801713374820',
    },
  });

  const sonapurStation = await prisma.policeStation.upsert({
    where: { station_id: 'station-sonapur-02' },
    update: {},
    create: {
      station_id: 'station-sonapur-02',
      station_name: 'Sonapur Model Police Station',
      location: 'Sonapur Bazar, Noakhali (22.8250° N, 91.1000° E)',
      contact_number: '+8801713374821',
    },
  });

  // 3. Police Officers
  const officer1 = await prisma.policeOfficer.upsert({
    where: { badge_number: 'BD-NK-101' },
    update: {},
    create: {
      officer_id: 'officer-id-101',
      name: 'Inspector M. Rahman',
      badge_number: 'BD-NK-101',
      station_id: maijdeeStation.station_id,
      rank: 'Inspector & Head of Investigation',
      contact: '+8801713374820',
    },
  });

  const officer2 = await prisma.policeOfficer.upsert({
    where: { badge_number: 'BD-NK-102' },
    update: {},
    create: {
      officer_id: 'officer-id-102',
      name: 'Sub-Inspector Kabir Hossain',
      badge_number: 'BD-NK-102',
      station_id: sonapurStation.station_id,
      rank: 'Sub-Inspector (Patrol Command)',
      contact: '+8801713374821',
    },
  });

  const officer3 = await prisma.policeOfficer.upsert({
    where: { badge_number: 'BD-NK-103' },
    update: {},
    create: {
      officer_id: 'officer-id-103',
      name: 'Sergeant Faruq Ahmed',
      badge_number: 'BD-NK-103',
      station_id: maijdeeStation.station_id,
      rank: 'Sergeant (Tactical Dispatch)',
      contact: '+8801713374822',
    },
  });

  // 4. Create User Accounts
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Citizen 1: Tanvir Ahmed
  const citizen1 = await prisma.user.upsert({
    where: { email: 'tanvir.ahmed@protego.com' },
    update: {},
    create: {
      full_name: 'Tanvir Ahmed',
      email: 'tanvir.ahmed@protego.com',
      phone: '+8801711223344',
      password: hashedPassword,
      address: 'House 42, Road 3, Maijdee Housing Estate, Noakhali',
      nid_number: '19947518920194821',
      role_id: citizenRole.role_id,
    },
  });

  // Citizen 2: Nusrat Jahan
  const citizen2 = await prisma.user.upsert({
    where: { email: 'nusrat.jahan@protego.com' },
    update: {},
    create: {
      full_name: 'Nusrat Jahan',
      email: 'nusrat.jahan@protego.com',
      phone: '+8801819876543',
      password: hashedPassword,
      address: 'Apt 4B, Green View Tower, Town Hall Road, Maijdee',
      nid_number: '19987519827361928',
      role_id: citizenRole.role_id,
    },
  });

  // Citizen 3: Kazi Mofizul Islam
  const citizen3 = await prisma.user.upsert({
    where: { email: 'kazi.mofiz@protego.com' },
    update: {},
    create: {
      full_name: 'Kazi Mofizul Islam',
      email: 'kazi.mofiz@protego.com',
      phone: '+8801912345678',
      password: hashedPassword,
      address: 'Shop 12, Sonapur Central Market, Noakhali',
      nid_number: '19857281920394812',
      role_id: citizenRole.role_id,
    },
  });

  // Citizen 4: Farhana Yasmin
  const citizen4 = await prisma.user.upsert({
    where: { email: 'farhana.yasmin@protego.com' },
    update: {},
    create: {
      full_name: 'Farhana Yasmin',
      email: 'farhana.yasmin@protego.com',
      phone: '+8801615554433',
      password: hashedPassword,
      address: 'NSTU Campus Residential Area, Sonapur, Noakhali',
      nid_number: '20017519283746192',
      role_id: citizenRole.role_id,
    },
  });

  // Standard Default Citizen
  const citizenDefault = await prisma.user.upsert({
    where: { email: 'citizen@protego.com' },
    update: {},
    create: {
      full_name: 'John Citizen',
      email: 'citizen@protego.com',
      phone: '+8801700000001',
      password: hashedPassword,
      address: 'Maijdee Bazar, Noakhali',
      nid_number: '1234567890',
      role_id: citizenRole.role_id,
    },
  });

  // Police Officers Login Accounts
  await prisma.user.upsert({
    where: { email: 'officer@protego.com' },
    update: {},
    create: {
      full_name: 'Inspector M. Rahman',
      email: 'officer@protego.com',
      phone: '+8801713374820',
      password: hashedPassword,
      address: 'Maijdee Police Station Headquarters',
      nid_number: '0987654321',
      role_id: policeRole.role_id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'officer.kabir@protego.com' },
    update: {},
    create: {
      full_name: 'Sub-Inspector Kabir Hossain',
      email: 'officer.kabir@protego.com',
      phone: '+8801713374821',
      password: hashedPassword,
      address: 'Sonapur Model Thana',
      nid_number: '0987654322',
      role_id: policeRole.role_id,
    },
  });

  // 5. Seed General Diaries (GDs)
  // Delete old demo records to maintain pristine state
  await prisma.caseTracking.deleteMany({});
  await prisma.case.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.crimeReport.deleteMany({});
  await prisma.generalDiary.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.sOSAlert.deleteMany({});

  // Tanvir's GD
  await prisma.generalDiary.create({
    data: {
      user_id: citizen1.user_id,
      title: 'Lost National ID Card & Passport Photocopy',
      description: 'Misplaced my original National ID Card along with certified passport photocopies near Maijdee Court premises during official work on Aug 28.',
      status: 'APPROVED',
      created_at: new Date('2026-08-28T10:15:00Z'),
    },
  });

  // Nusrat's GD
  await prisma.generalDiary.create({
    data: {
      user_id: citizen2.user_id,
      title: 'Missing Smartphone in Sonapur Market Area',
      description: 'Lost my Samsung Galaxy A54 smartphone with Grameenphone SIM (+8801819876543) while shopping in Sonapur Supermarket.',
      status: 'PENDING',
      created_at: new Date('2026-09-01T16:30:00Z'),
    },
  });

  // Kazi Mofiz's GD
  await prisma.generalDiary.create({
    data: {
      user_id: citizen3.user_id,
      title: 'Misplaced SSC & HSC Original Educational Transcripts',
      description: 'Lost academic dossier containing original Board marksheets in a yellow envelope near Noakhali Government College gate.',
      status: 'APPROVED',
      created_at: new Date('2026-08-24T11:00:00Z'),
    },
  });

  // Farhana's GD
  await prisma.generalDiary.create({
    data: {
      user_id: citizen4.user_id,
      title: 'Lost Motorbike Digital Smart Registration Card',
      description: 'Misplaced digital BRTA smart registration card for Honda CB Hornet (Metro-HA-12-3456) around NSTU Main Gate.',
      status: 'PENDING',
      created_at: new Date('2026-08-31T09:45:00Z'),
    },
  });

  // John Citizen's GD
  await prisma.generalDiary.create({
    data: {
      user_id: citizenDefault.user_id,
      title: 'Lost Official Bank Cheque Book',
      description: 'Sonali Bank Maijdee Branch 25-leaf cheque book lost during commute between Maijdee Bazar and Town Hall.',
      status: 'APPROVED',
      created_at: new Date('2026-08-29T14:20:00Z'),
    },
  });

  // 6. Seed Crime Reports
  // Tanvir's Crime Report -> Under Investigation
  const crime1 = await prisma.crimeReport.create({
    data: {
      user_id: citizen1.user_id,
      crime_type: 'Motorcycle Theft',
      description: 'Red Yamaha FZS-V3 motorcycle (Reg: Noakhali-LA-11-8899) stolen from outside Maijdee Supermarket parking area between 1:00 PM and 2:30 PM.',
      location: 'Maijdee Supermarket Parking, Noakhali (22.8710° N, 91.0920° E)',
      date_time: new Date('2026-08-30T14:30:00Z'),
      status: 'INVESTIGATING',
    },
  });

  // Create Case & Tracking for Crime 1
  const case1 = await prisma.case.create({
    data: {
      report_id: crime1.report_id,
      officer_id: officer1.officer_id,
      case_status: 'OPEN',
      assigned_date: new Date('2026-08-30T16:00:00Z'),
    },
  });

  await prisma.caseTracking.create({
    data: {
      case_id: case1.case_id,
      status_update: 'CCTV footage recovered from supermarket security cameras. Suspect identified on surveillance leaving towards Sonapur Bypass.',
      updated_by: officer1.officer_id,
      updated_at: new Date('2026-08-31T11:30:00Z'),
    },
  });

  // Nusrat's Crime Report -> Pending
  await prisma.crimeReport.create({
    data: {
      user_id: citizen2.user_id,
      crime_type: 'Attempted Residential Burglary',
      description: 'Two masked individuals attempted to break the main security padlock at residential compound entrance at midnight. Fled upon triggering safety alarm.',
      location: 'Town Hall Road, Maijdee, Noakhali (22.8685° N, 91.0850° E)',
      date_time: new Date('2026-09-01T23:15:00Z'),
      status: 'PENDING',
    },
  });

  // Kazi Mofiz's Crime Report -> Resolved
  const crime3 = await prisma.crimeReport.create({
    data: {
      user_id: citizen3.user_id,
      crime_type: 'Armed Snatching / Robbery',
      description: 'Snatching of commercial cash bag containing Tk 45,000 near Sonapur Railway Station platform walkway.',
      location: 'Sonapur Railway Station, Noakhali (22.8245° N, 91.0995° E)',
      date_time: new Date('2026-08-25T19:40:00Z'),
      status: 'RESOLVED',
    },
  });

  const case3 = await prisma.case.create({
    data: {
      report_id: crime3.report_id,
      officer_id: officer2.officer_id,
      case_status: 'CLOSED',
      assigned_date: new Date('2026-08-25T20:30:00Z'),
    },
  });

  await prisma.caseTracking.create({
    data: {
      case_id: case3.case_id,
      status_update: 'Mobile patrol unit intercepted perpetrators near Railway Crossing. Full cash recovered and handed back to citizen.',
      updated_by: officer2.officer_id,
      updated_at: new Date('2026-08-26T14:00:00Z'),
    },
  });

  // Farhana's Crime Report -> Under Investigation
  const crime4 = await prisma.crimeReport.create({
    data: {
      user_id: citizen4.user_id,
      crime_type: 'Public Harassment & Stalking',
      description: 'Repeated harassment and stalking incidents near NSTU Campus Road by an unauthorized biker gang during evening hours.',
      location: 'NSTU Campus Gate, Sonapur, Noakhali (22.7930° N, 91.1005° E)',
      date_time: new Date('2026-08-31T17:10:00Z'),
      status: 'INVESTIGATING',
    },
  });

  const case4 = await prisma.case.create({
    data: {
      report_id: crime4.report_id,
      officer_id: officer3.officer_id,
      case_status: 'OPEN',
      assigned_date: new Date('2026-08-31T18:00:00Z'),
    },
  });

  await prisma.caseTracking.create({
    data: {
      case_id: case4.case_id,
      status_update: 'Increased evening motorized mobile patrol on University Highway and established static security checkpoint.',
      updated_by: officer3.officer_id,
      updated_at: new Date('2026-09-01T10:00:00Z'),
    },
  });

  // John Citizen's Crime Report -> Pending
  await prisma.crimeReport.create({
    data: {
      user_id: citizenDefault.user_id,
      crime_type: 'Commercial Vandalism',
      description: 'Glass storefront shattered and outdoor surveillance camera damaged by unruly mob at Maijdee Tower Plaza.',
      location: 'Maijdee Tower Plaza, Noakhali (22.8735° N, 91.0895° E)',
      date_time: new Date('2026-09-02T10:00:00Z'),
      status: 'PENDING',
    },
  });

  // 7. Seed Notifications in DB
  await prisma.notification.createMany({
    data: [
      {
        user_id: citizen1.user_id,
        message: 'Your General Diary "Lost National ID Card & Passport Photocopy" has been reviewed and APPROVED by Maijdee Central Police HQ.',
        type: 'GD_APPROVED',
        status: 'READ',
        sent_at: new Date('2026-08-28T12:00:00Z'),
      },
      {
        user_id: citizen1.user_id,
        message: 'Officer Inspector M. Rahman assigned to investigate your Motorcycle Theft report (Case #' + case1.case_id.slice(0, 8) + ').',
        type: 'CASE_ASSIGNED',
        status: 'UNREAD',
        sent_at: new Date('2026-08-30T16:05:00Z'),
      },
      {
        user_id: citizen2.user_id,
        message: 'Your General Diary "Missing Smartphone in Sonapur Market Area" was registered into Central Police records.',
        type: 'GD_SUBMITTED',
        status: 'UNREAD',
        sent_at: new Date('2026-09-01T16:35:00Z'),
      },
      {
        user_id: citizen3.user_id,
        message: 'Your crime report for "Armed Snatching / Robbery" has been marked as RESOLVED by Sub-Inspector Kabir Hossain.',
        type: 'CRIME_RESOLVED',
        status: 'READ',
        sent_at: new Date('2026-08-26T14:05:00Z'),
      },
      {
        user_id: citizen4.user_id,
        message: 'Sergeant Faruq Ahmed has logged an investigation update: "Increased evening motorized mobile patrol on University Highway."',
        type: 'CASE_UPDATE',
        status: 'UNREAD',
        sent_at: new Date('2026-09-01T10:05:00Z'),
      },
    ],
  });

  console.log('✅ Comprehensive natural seed data populated successfully in database!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
