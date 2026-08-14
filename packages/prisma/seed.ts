import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('Admin@1234', 12);

  await prisma.admin.upsert({
    where: { email: 'admin@jeabmint.com' },
    update: {},
    create: {
      email: 'admin@jeabmint.com',
      passwordHash,
    },
  });

  console.log('✅ Admin created: admin@jeabmint.com / Admin@1234');
  console.log('⚠️  เปลี่ยน password ก่อน go live!');

  await prisma.weddingSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      groomName: 'ปิติสันห์ อินทพิชัย',
      groomNickname: 'มิ้นท์',
      brideName: 'นิรมล เจตเพ็ญภาส',
      brideNickname: 'เจี๊ยบ',
      weddingDate: new Date('2026-10-31T14:00:00+07:00'),
      venue: 'กรมยุทธบริการทหาร กองบัญชาการกองทัพไทย',
      city: 'อาคารอเนกประสงค์ กรุงเทพฯ',
      lineOaId: '@528nhzxv',
      lineOaUrl: 'https://line.me/R/ti/p/@528nhzxv',
      rsvpContactPhone: '0655496538',
      mapsUrl: 'https://maps.app.goo.gl/MuHkXeetp6Ac5zGu9',
      rsvpDeadline: new Date('2026-10-14T00:00:00+07:00'),
      promptpay: '081-234-5678',
      promptpayName: 'นิรมล เจตเพ็ญภาส',
      timeline: [
        { time: '14:00', event: 'พิธีแห่ขันหมาก' },
        { time: '15:30', event: 'พิธีหลั่งน้ำพระพุทธมนต์' },
        { time: '18:30', event: 'พิธีฉลองมงคลสมรส' },
      ],
    },
  });

  console.log('✅ Wedding settings seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
