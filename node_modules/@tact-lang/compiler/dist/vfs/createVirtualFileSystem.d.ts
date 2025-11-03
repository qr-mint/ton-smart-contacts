import type { VirtualFileSystem } from "./VirtualFileSystem";
export declare function createVirtualFileSystem(root: string, fs: Record<string, string>, readonly?: boolean): VirtualFileSystem;
