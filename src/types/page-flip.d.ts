declare module "page-flip" {
  export type PageFlipEvent = {
    data: number | { page: number; mode: string };
    object: unknown;
  };

  export class PageFlip {
    constructor(
      element: HTMLElement,
      settings: Record<string, unknown>,
    );
    loadFromHTML(pages: NodeListOf<HTMLElement> | HTMLElement[]): void;
    loadFromImages(images: string[]): void;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    destroy(): void;
    on(event: string, cb: (e: PageFlipEvent) => void): PageFlip;
    off(event: string): void;
    update(): void;
  }
}
