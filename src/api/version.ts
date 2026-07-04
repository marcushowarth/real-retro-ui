export interface VersionInfo {
  version: string;
  gitSha: string;
  builtAt: string;
}

export function fetchVersion(): Promise<VersionInfo> {
  return fetch('/api/version').then(r => r.json());
}
