export const CAMPAIGN_TEMPLATES = [
  {
    id: 'weekend_market',
    label: 'Weekend Farmers Market',
    subject: 'Fresh picks this weekend — shop on Hazel Allure',
    bodyText:
      'We just harvested fresh produce for the weekend! Browse what is in season and order for pickup through our Hazel Allure storefront.',
  },
  {
    id: 'new_menu_item',
    label: 'New menu item',
    subject: 'Something new on our menu',
    bodyText:
      'We added a new dish to our menu. Come see photos, allergens, and safety info — then order directly on Hazel Allure.',
  },
  {
    id: 'seasonal_special',
    label: 'Seasonal special',
    subject: 'Limited-time seasonal special',
    bodyText:
      'For a short time we are offering a seasonal favorite. Quantities are limited — visit our Hazel Allure page to order.',
  },
  {
    id: 'thank_you',
    label: 'Thank loyal customers',
    subject: 'Thank you for supporting our local kitchen',
    bodyText:
      'Thank you for being part of our Hazel Allure community. We appreciate every order and message — see what is new on our storefront.',
  },
  {
    id: 'preorder',
    label: 'Pre-order reminder',
    subject: 'Pre-orders now open',
    bodyText:
      'Pre-orders are open for upcoming availability. Reserve yours on Hazel Allure before we sell out.',
  },
];

export function getCampaignTemplate(id) {
  return CAMPAIGN_TEMPLATES.find((t) => t.id === id) || null;
}