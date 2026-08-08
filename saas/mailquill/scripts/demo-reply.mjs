import { draftReply } from '../src/engine/reply.js';

const thread = [
  {
    from: 'buyer@example.com',
    to: 'shop@hazelallure.com',
    subject: 'Deodorant order',
    body: 'Hi, I ordered the Alpha Bro deodorant yesterday. When will it ship?',
  },
  {
    from: 'shop@hazelallure.com',
    to: 'buyer@example.com',
    body: 'Thanks for ordering! We are packing orders today.',
  },
  {
    from: 'buyer@example.com',
    to: 'shop@hazelallure.com',
    body: 'Great — can you use Priority Mail? Also please confirm tracking.',
  },
];

const draft = await draftReply({
  mode: 'thread',
  tone: 'friendly_professional',
  goal: 'Confirm Priority Mail, promise tracking when label is bought, be warm',
  thread,
  myName: 'Alpha Bro shop',
  brandName: 'Hazel Allure maker',
});

console.log(JSON.stringify(draft, null, 2));
