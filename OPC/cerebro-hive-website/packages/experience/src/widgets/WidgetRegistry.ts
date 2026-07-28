
export type RefreshPolicy = 'manual' | '30s' | '1m' | 'background';

export interface WidgetDefinition {
  id: string;
  title: string;
  category: string;
  icon: string;
  columnSpan: number;
  rowSpan: number;
  permissions: string[];
  defaultVisibility: boolean;
  refreshPolicy: RefreshPolicy;
  component: React.ComponentType<any>;
}

class WidgetRegistryImpl {
  private widgets = new Map<string, WidgetDefinition>();

  register(widget: WidgetDefinition) {
    this.widgets.set(widget.id, widget);
  }

  getWidget(id: string) {
    return this.widgets.get(id);
  }

  getAll() {
    return Array.from(this.widgets.values());
  }
}

export const WidgetRegistry = new WidgetRegistryImpl();
