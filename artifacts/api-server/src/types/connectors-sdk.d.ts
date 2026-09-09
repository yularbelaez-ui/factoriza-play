declare module "@replit/connectors-sdk" {
  export class ReplitConnectors {
    proxy(provider: string, path: string, init?: RequestInit): Promise<Response>;
  }
}