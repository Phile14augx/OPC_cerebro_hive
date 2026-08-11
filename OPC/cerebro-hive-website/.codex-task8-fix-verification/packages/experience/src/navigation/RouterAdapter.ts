
export interface RouterAdapter {
  push: (path: string) => void;
  replace: (path: string) => void;
  onPathChange: (callback: (path: string) => void) => () => void;
}
