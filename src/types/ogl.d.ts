declare module 'ogl' {
  // Minimal type shims for the ogl classes used; extend as needed.
  export class Renderer {
    constructor(options?: any);
    gl: WebGLRenderingContext & { canvas: HTMLCanvasElement };
    setSize(width: number, height: number): void;
    render(options: any): void;
  }
  export class Camera {
    constructor(gl: WebGLRenderingContext, options?: any);
    position: { set: (x: number, y: number, z: number) => void };
    perspective(options: any): void;
  }
  export class Geometry {
    constructor(gl: WebGLRenderingContext, attributes: any);
  }
  export class Program {
    constructor(gl: WebGLRenderingContext, options: any);
    uniforms: Record<string, { value: any }>;
  }
  export class Mesh {
    constructor(gl: WebGLRenderingContext, options: any);
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  }
}