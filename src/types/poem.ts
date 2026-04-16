export type Tag = string;

export interface Poem {
  id: string;
  text: string;   // multi-line verse; newlines are preserved
  poet: string;
  source: string;
  tags: Tag[];
}
