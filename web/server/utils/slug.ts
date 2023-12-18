import slugify from 'slugify';

export function createSlug(input: string, id?: number) {
  return slugify(
    `${input.substring(0, 16)}-${id || Math.floor(Math.random() * 10e5)}`,
    {
      trim: true,
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@/]/g
    }
  );
}
