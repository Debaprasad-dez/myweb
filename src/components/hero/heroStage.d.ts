export function mountHero(options: {
  sceneEl: HTMLElement;
  skyEl: HTMLElement;
  images: { g3: string; portrait: string; wide: string };
  ascii: string;
}): () => void;
