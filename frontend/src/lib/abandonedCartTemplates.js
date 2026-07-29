/** Copy-ready abandoned cart / restock templates for Pro vendors. */

export function buildAbandonedCartTemplates({ vendorName, shopUrl, productHint = 'your favorites' }) {
  const shop = vendorName || 'our shop';
  const url = shopUrl || 'https://apothecary.hazelallure.com';
  return [
    {
      id: 'gentle-nudge',
      channel: 'SMS / DM',
      title: 'Gentle cart nudge',
      body: `Hi! You left ${productHint} in your cart at ${shop}. Still thinking it over? Here’s the link when you’re ready: ${url} — reply STOP to opt out.`,
    },
    {
      id: 'restock-friendly',
      channel: 'Email',
      title: 'Still on the shelf',
      subject: `Still saving ${productHint}?`,
      body: `Hello,\n\nWe noticed you started an order at ${shop} and didn’t check out. No pressure — just a friendly note that stock moves quickly on handmade goods.\n\nContinue here: ${url}\n\nWith care,\n${shop}`,
    },
    {
      id: 'bundle-upsell',
      channel: 'Email',
      title: 'Complete the kit',
      subject: `A small add-on for your order at ${shop}`,
      body: `Hi there,\n\nIf you were building a ritual or wellness kit, many shoppers pair their cart with a tea or blessing add-on.\n\nFinish checkout: ${url}\n\nQuestions? Just reply to this email.\n\n— ${shop}`,
    },
    {
      id: 'market-day',
      channel: 'SMS',
      title: 'Market-day pickup reminder',
      body: `${shop} is pickup-only today (market day). Grab what you left in cart for same-day pickup: ${url}`,
    },
    {
      id: 'review-after-pickup',
      channel: 'SMS',
      title: 'Thanks + review (post pickup)',
      body: `Thank you for picking up from ${shop}! If you have 30 seconds, a short review helps other seekers: ${url}?review=1`,
    },
  ];
}
