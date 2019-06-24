declare class Fluorite {
  options: {
    themeConfig: ThemeConfig;
    basePath: string;
  };
  config: FluoriteConfig;
  on: (event: string, cb: (...args: any[]) => void) => Fluorite;
  load: (configPath: string) => Fluorite;
  generate: () => Promise<void>;
  serve: (port: number) => Promise<void>;
}

interface ThemeConfig {
  [key: string]: any;
}

interface FluoriteConfig {
  title: string;
  basePath?: string;
  rootContent?: string;
  contentAssets?: { [path: string]: string };
  outputDir: string;
  rendererOptions?: RendererOptions;
  serverOptions?: ServerOptions;
  themeOptions?: ThemeConfig;
}

interface RendererOptions {
  theme?: string;
  flavor?: string;
  multiPage?: boolean;
  versions?: string[];
  hideEmptyColumns?: boolean;
  rootVersionLinksOnly?: boolean;
  minifyJS: boolean;
  minifyCSS: boolean;
}

interface ServerOptions {
  port?: number;
}

export = Fluorite;
