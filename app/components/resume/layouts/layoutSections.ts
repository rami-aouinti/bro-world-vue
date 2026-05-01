export const SECTION_KEYS = ['header','contact','experience','education','skill','language','project','interest','reference','certification'] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

const rotate = (start: number) => SECTION_KEYS.slice(start).concat(SECTION_KEYS.slice(0,start))
export const STRUCTURES = Array.from({length:10}).reduce<Record<string, SectionKey[]>>((acc, _, i) => {
  acc[`structure-${i+1}`] = rotate(i) as SectionKey[]
  return acc
}, {})
