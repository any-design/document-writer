export interface WriterOptions {
  // output directory
  output?: string;
  // Vue component version
  version?: '2' | '3';
  // Document language
  language?: string;
  // File name watcher
  matcher: RegExp;
}
