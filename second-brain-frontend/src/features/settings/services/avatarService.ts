
export type AvatarCategory = 'professional' | 'stylish' | 'crazy' | 'sport-freak' | 'tech-freak';

const CATEGORY_STYLES: Record<AvatarCategory, string[]> = {
  professional: ['personas', 'notionists', 'avataaars-neutral'],
  stylish: ['lorelei', 'open-peeps', 'adventurer'],
  crazy: ['fun-emoji', 'micah', 'croodles'],
  'sport-freak': ['adventurer', 'big-ears'],
  'tech-freak': ['bottts', 'pixel-art', 'identicon'],
};

export const avatarService = {
  getStylesByCategory(category: AvatarCategory): string[] {
    return CATEGORY_STYLES[category] || CATEGORY_STYLES.professional;
  },

  generateAvatar(style: string, seed: string): string {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  },

  getAvatarsByCategory(category: AvatarCategory, count: number = 42): string[] {
    const styles = this.getStylesByCategory(category);
    const avatars: string[] = [];
    for (let i = 0; i < count; i++) {
      const style = styles[i % styles.length];
      const seed = `${category}-${i}-seed-${i * 123}`;
      avatars.push(this.generateAvatar(style, seed));
    }
    return avatars;
  }
};
