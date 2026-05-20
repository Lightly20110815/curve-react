import generated from "./generated/notes.json";

export interface Note {
  slug: string;
  title: string;
  date: string;
  mood?: string;
  tags: string[];
  description: string;
  html: string;
  top: boolean;
}

export const notes: Note[] = generated as Note[];
