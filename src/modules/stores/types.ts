import type {
  Store,
  StoreConfig,
  StoreSettings,
  ThemeConfig,
  StoreStatus,
  CreateStore,
  UpdateStore,
} from "../../types";

export type StoreConfigurationInfo = Store & {
  config: StoreConfig;
  settings: StoreSettings;
  theme_config?: ThemeConfig;
};

export type {
  Store,
  StoreConfig,
  StoreSettings,
  ThemeConfig,
  StoreStatus,
  CreateStore,
  UpdateStore,
};
