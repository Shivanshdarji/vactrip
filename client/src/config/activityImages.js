/** Unsplash fallbacks when activity.image is missing */
export const ACTIVITY_TYPE_IMAGES = {
  adventure:
    'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=70',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70',
  culture:
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=70',
  wellness:
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=70',
  sightseeing:
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=70',
  shopping:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=70',
  default:
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=70',
};

export function activityImageUrl(activity) {
  if (activity?.image && String(activity.image).trim()) return activity.image;
  const t = activity?.type && ACTIVITY_TYPE_IMAGES[activity.type];
  return t || ACTIVITY_TYPE_IMAGES.default;
}
