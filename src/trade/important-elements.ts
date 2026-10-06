interface ImportantElement {
  id: string;
  find: () => HTMLElement[];
  expected?: number; // exact number of matches the site renders (default 1); the id goes on the first
}

const all = (selector: string, root: ParentNode = document) => [...root.querySelectorAll<HTMLElement>(selector)];

export const IMPORTANT_ELEMENTS: ImportantElement[] = [
  // The filter column: livesearch controls and our filter panels mount here, the site's panels are hidden
  { id: "filters", find: () => all("div.filters > div") },
];
