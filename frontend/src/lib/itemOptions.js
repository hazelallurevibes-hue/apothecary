/** Parse and validate vendor-defined item options (salt, utensils, etc.) */

export function parseItemOptions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function parseCheckoutUpsells(raw) {
  return parseItemOptions(raw).map((u, i) => ({
    id: u.id || `upsell-${i}`,
    name: u.name || 'Add-on',
    price: Number(u.price) || 0,
    category: u.category || 'side',
    description: u.description || '',
  }));
}

export function slugifyOptionId(label) {
  return String(label || 'option')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 32) || 'option';
}

export function createEmptyOption() {
  return {
    id: `opt_${Date.now()}`,
    label: '',
    required: false,
    multi: false,
    choices: [
      { id: 'yes', label: 'Yes', price: 0 },
      { id: 'no', label: 'No', price: 0 },
    ],
  };
}

export function createEmptyUpsell() {
  return {
    id: `upsell_${Date.now()}`,
    name: '',
    price: '',
    category: 'drink',
    description: '',
  };
}

export function normalizeOptionsForSave(options) {
  return (options || [])
    .filter((g) => g.label?.trim())
    .map((g, gi) => ({
      id: g.id || slugifyOptionId(g.label) || `group_${gi}`,
      label: g.label.trim(),
      required: !!g.required,
      multi: !!g.multi,
      choices: (g.choices || [])
        .filter((c) => c.label?.trim())
        .map((c, ci) => ({
          id: c.id || slugifyOptionId(c.label) || `choice_${ci}`,
          label: c.label.trim(),
          price: Number(c.price) || 0,
        })),
    }))
    .filter((g) => g.choices.length > 0);
}

export function normalizeUpsellsForSave(upsells) {
  return (upsells || [])
    .filter((u) => u.name?.trim())
    .map((u, i) => ({
      id: u.id || slugifyOptionId(u.name) || `upsell_${i}`,
      name: u.name.trim(),
      price: Number(u.price) || 0,
      category: u.category || 'side',
      description: (u.description || '').trim(),
    }));
}

export function defaultSelectedOptions(optionGroups) {
  const selected = {};
  for (const group of optionGroups) {
    if (group.choices?.length) {
      selected[group.id] = group.choices[0].id;
    }
  }
  return selected;
}

export function validateSelectedOptions(optionGroups, selected) {
  const missing = [];
  for (const group of optionGroups) {
    if (!group.required) continue;
    const val = selected?.[group.id];
    if (group.multi) {
      if (!Array.isArray(val) || val.length === 0) missing.push(group.label);
    } else if (!val) {
      missing.push(group.label);
    }
  }
  return missing;
}

export function optionExtraPrice(optionGroups, selected) {
  let extra = 0;
  for (const group of optionGroups) {
    const val = selected?.[group.id];
    if (!val) continue;
    const ids = Array.isArray(val) ? val : [val];
    for (const choiceId of ids) {
      const choice = group.choices?.find((c) => c.id === choiceId);
      if (choice) extra += Number(choice.price) || 0;
    }
  }
  return extra;
}

export function computeLinePrice(basePrice, optionGroups, selected) {
  return (Number(basePrice) || 0) + optionExtraPrice(optionGroups, selected);
}

export function formatOptionsSummary(optionGroups, selected) {
  const parts = [];
  for (const group of optionGroups) {
    const val = selected?.[group.id];
    if (!val) continue;
    const ids = Array.isArray(val) ? val : [val];
    const labels = ids
      .map((id) => group.choices?.find((c) => c.id === id)?.label)
      .filter(Boolean);
    if (labels.length) parts.push(`${group.label}: ${labels.join(', ')}`);
  }
  return parts.join(' · ');
}

export function cartLineKey(item) {
  const opts = item.selectedOptions || {};
  const kind = item.isUpsell ? `upsell-${item.upsellId}` : `item-${item.id}`;
  return `${kind}-${JSON.stringify(opts)}`;
}