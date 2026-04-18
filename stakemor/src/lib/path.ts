export type PathId = 'long' | 'short';

export interface PathChangeDetail {
  path: PathId;
}

declare global {
  interface WindowEventMap {
    pathchange: CustomEvent<PathChangeDetail>;
  }
}
