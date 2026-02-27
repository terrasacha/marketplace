import MainLayout from "@marketplaces/ui-lib/src/lib/common/MainLayout"
import NoLayout from "@marketplaces/ui-lib/src/lib/common/NoLayout";
export const Layouts = {
  Main: MainLayout,
  NoLayout: NoLayout
};
export type LayoutKeys = keyof typeof Layouts
