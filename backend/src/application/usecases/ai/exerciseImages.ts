/**
 * Shared Unsplash image map for exercises, keyed by normalised muscle group name.
 */
export const EXERCISE_IMAGES: Record<string, string[]> = {
  pecho: [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1619058560166-1053dafc69a3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=400&h=300&fit=crop',
  ],
  espalda: [
    'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1598971639058-a081e2554625?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  ],
  piernas: [
    'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1596357395104-ba989e72b5ec?w=400&h=300&fit=crop',
  ],
  hombros: [
    'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1598971639058-a081e2554625?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
  ],
  brazos: [
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=400&h=300&fit=crop',
  ],
  abdominales: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop',
  ],
  gluteos: [
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1596357395104-ba989e72b5ec?w=400&h=300&fit=crop',
  ],
  // Fallback for any other group
  general: [
    'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  ],
};

/** Pick a deterministic image URL for a given muscle group and position index. */
export function getExerciseImage(muscleGroup: string, index: number): string {
  const key = (muscleGroup ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[\s,/]+/)[0]  // take only the first word (e.g. "pecho y triceps" → "pecho")
    .trim();
  const images = EXERCISE_IMAGES[key] ?? EXERCISE_IMAGES['general'];
  return images[index % images.length];
}
