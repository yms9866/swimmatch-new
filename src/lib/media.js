// Placeholder photography for the Lane Lines design (free-licence Unsplash).
// Providers have no photos of their own yet, so each one gets a stable pick
// from this pool. Replace with real provider photos when they exist.
const base = "/images/lane/";

export const PHOTOS = {
  heroFly: { src: `${base}hero-fly.jpg`, alt: "Swimmer mid-butterfly between lane ropes", pos: "50% 45%" },
  compete: { src: `${base}compete.jpg`, alt: "Swimmers diving off the blocks in a row of lanes", pos: "50% 55%" },
  trio: { src: `${base}trio.jpg`, alt: "Freestyle swimmers between lane ropes", pos: "30% 40%" },
  girlSwim: { src: `${base}girl-swim.jpg`, alt: "Child in pink goggles bursting out of the water", pos: "50% 40%" },
  teach: { src: `${base}teach.jpg`, alt: "Coach guiding a swimmer's glide", pos: "55% 60%" },
  kidsBoard: { src: `${base}kids-board.jpg`, alt: "Group of swimmers with kickboards listening to a coach", pos: "50% 70%" },
  skyline: { src: `${base}skyline-pool.jpg`, alt: "Outdoor pool in front of a city skyline", pos: "50% 70%" },
  goggles: { src: `${base}blue-goggles.jpg`, alt: "Swimmer in blue goggles at the surface", pos: "30% 50%" },
  indoor: { src: `${base}indoor-lanes.jpg`, alt: "Calm indoor pool with lane ropes and tall windows", pos: "50% 80%" },
  peace: { src: `${base}peace.jpg`, alt: "Smiling swimmer in orange goggles raising a peace sign", pos: "30% 25%" },
  orangeCap: { src: `${base}orange-cap.jpg`, alt: "Swimmer in an orange cap resting at the wall", pos: "45% 12%" },
  aerial: { src: `${base}aerial.jpg`, alt: "Aerial view of a lane pool", pos: "50% 50%" },
  underwater: { src: `${base}underwater.jpg`, alt: "Swimmer gliding underwater", pos: "50% 50%" },
  water: { src: `${base}water.jpg`, alt: "Light rippling through pool water", pos: "50% 50%" },
};

const providerPool = ["compete", "trio", "skyline", "goggles", "indoor", "teach", "aerial", "underwater", "kidsBoard", "heroFly"];
// The approved mockups paired these providers with these photos.
const fixed = { 3: "compete", 8: "trio", 24: "skyline", 1: "goggles", 15: "indoor" };

function key(id) {
  const n = Number(id);
  if (fixed[n]) return fixed[n];
  return providerPool[Math.abs(Number.isFinite(n) ? n : String(id).length) % providerPool.length];
}

export function providerPhoto(provider) {
  return PHOTOS[key(provider.id)];
}

/** Three distinct photos for the provider profile collage. */
export function providerGallery(provider) {
  const first = key(provider.id);
  const start = providerPool.indexOf(first);
  const rest = providerPool.filter((k) => k !== first);
  const offset = Math.max(0, start);
  return [first, rest[(offset + 2) % rest.length], rest[(offset + 5) % rest.length]].map((k) => PHOTOS[k]);
}

/** Image masks rotate so no two neighbouring rows share a shape. */
export const MASKS = ["mask-soft", "mask-arch", "mask-circle", "mask-leaf"];
export const maskFor = (index) => MASKS[index % MASKS.length];
