export const PERMISSION_KEYS = [
  "dashboard",
  "properties",
  "inquiries",
  "blog",
  "testimonials",
  "users",
  "content",
  "developers",
  "settings",
];

export const FULL_ACCESS_PERMISSIONS = PERMISSION_KEYS.reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {});

export const LIMITED_DEFAULT_PERMISSIONS = {
  dashboard: true,
  properties: false,
  inquiries: true,
  blog: false,
  testimonials: false,
  users: false,
  content: false,
  developers: false,
  settings: false,
};
