// Run this once to generate your VAPID keys:
//   npx ts-node scripts/generate-vapid-keys.ts
//
// Or just run in Node:
//   node -e "const w = require('web-push'); const k = w.generateVAPIDKeys(); console.log('Public:', k.publicKey); console.log('Private:', k.privateKey);"

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n🔑 VAPID Keys Generated\n');
console.log('Add these to your .env.local and Vercel environment variables:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:your-email@example.com`);
console.log('\n⚠️  Keep VAPID_PRIVATE_KEY secret. Never expose it client-side.\n');