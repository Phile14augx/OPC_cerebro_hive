
export interface OverlayItem {
  id: string;
  type: 'toast' | 'dialog' | 'drawer' | 'popover';
  content: any; // ReactNode
  priority: number;
}

class OverlayServiceImpl {
  private activeOverlays: OverlayItem[] = [];
  
  open(overlay: Omit<OverlayItem, 'id'>) {
    const id = crypto.randomUUID();
    this.activeOverlays.push({ ...overlay, id });
    return id;
  }

  close(id: string) {
    this.activeOverlays = this.activeOverlays.filter(o => o.id !== id);
  }
}

export const OverlayService = new OverlayServiceImpl();
