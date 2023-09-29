import pandora from "@faizaanceg/pandora";
import { NewfoldRuntime } from "../sdk/NewfoldRuntime";
import { __ } from "@wordpress/i18n";
import { PluginsSdk } from "../sdk/plugins";
import { RuntimeSdk } from "../sdk/runtime";
import { WooCommerceSdk } from "../sdk/woocommerce";
import { WordPressSdk } from "../sdk/wordpress";
import { createPluginInstallAction } from "./actions";
import { 
  wcTasksParser, yithOnboardingParser, yithOnboardingPaymentParser, 
  yithOnboardingStoreParser, mediaUploadedSelector, getExperienceLevel 
} from "./selectors";
import { AnalyticsSdk } from "../sdk/analytics";

const parsePluginStatus = (plugins) => ({
  isWCActive: PluginsSdk.queries.isPlugin(plugins, ["woocommerce"], "active"),
  isJetpackActive: PluginsSdk.queries.isPlugin(plugins, ["jetpack"], "active"),
});

const CaptiveFlows = {
  paypal: "nfd-ecommerce-captive-flow-paypal",
  shippo: "nfd-ecommerce-captive-flow-shippo",
  razorpay: "nfd-ecommerce-captive-flow-razorpay",
};

const data = {
  page: window.location.href
}

export function OnboardingListDefinition(props) {
  const installJetpack = createPluginInstallAction("jetpack", 20, props);
  return {
    dataDependencies: {
      plugins: async () => PluginsSdk.queries.status("woocommerce", "jetpack"),
      products: WooCommerceSdk.products.list,
      onboarding: WooCommerceSdk.onboarding.tasks,
      settings: WordPressSdk.settings.get,
      media: WordPressSdk.media.get,
    },
    cards: [
      {
        name: "Sign up for Bluehost WordPress Academy",
        text: __("Sign up for Bluehost WordPress Academy", "wp-module-ecommerce"),
        state: {
          isAvailable: (queries) => queries?.settings && RuntimeSdk?.brandSettings?.brand?.includes("bluehost"),
          isCompleted: () => false,
          url: () => "https://academy.bluehost.com/?utm_source=wp-home&utm_medium=brand-plugin",
          target: () => "_blank"
        },
        shouldRender: (state) => state.isAvailable,
        actions: {
          manage: () => AnalyticsSdk.track("next_step", "next_step_bh_wp_academy_clicked", data),
        },
        queries: [
          { key: "settings", selector: getExperienceLevel() },
        ],
      },
      {
        name: "Add your store info",
        text: __("Add your store info", "wp-module-ecommerce"),
        state: {
          isAvailable: (queries) => queries?.plugins?.isWCActive,
          isCompleted: (queries) => queries?.settings,
          url: () => "#/store/details?highlight=details",
        },
        shouldRender: (state) => state.isAvailable,
        actions: {},
        queries: [
          { key: "settings", selector: yithOnboardingStoreParser() },
          { key: "plugins", selector: parsePluginStatus },
        ],
      },
      {
        name: "Connect a payment processor",
        text: __("Connect a payment processor", "wp-module-ecommerce"),
        state: {
          isAvailable: (queries) =>
            queries?.plugins?.isWCActive &&
            RuntimeSdk.brandSettings.setup.payment.length > 0,
          isCompleted: (queries) => queries?.settings?.isCompleted,
          url: () => "#/store/payments",
        },
        shouldRender: (state) => state.isAvailable,
        actions: {},
        queries: [
          { key: "plugins", selector: parsePluginStatus },
          {
            key: "settings",
            selector: yithOnboardingPaymentParser([CaptiveFlows.paypal, CaptiveFlows.razorpay]),
          },
        ],
      },
      {
        name: "Setup shipping options",
        text: __("Setup shipping options", "wp-module-ecommerce"),
        state: {
          isAvailable: (queries) =>
            queries?.plugins?.isWCActive &&
            RuntimeSdk.brandSettings.setup.shipping.length > 0,
          isCompleted: (queries) => queries?.settings?.isCompleted,
          url: () => "#/store/details?highlight=shipping",
        },
        shouldRender: (state) => state.isAvailable,
        actions: {},
        queries: [
          { key: "plugins", selector: parsePluginStatus },
          {
            key: "settings",
            selector: yithOnboardingParser(CaptiveFlows.shippo),
          },
        ],
      },
      {
        name: "Configure tax settings",
        text: __("Configure tax settings", "wp-module-ecommerce"),
        state: {
          isAvailable: (queries) => queries?.plugins?.isWCActive,
          isCompleted: (queries) => queries?.onboarding?.isCompleted,
          url: () => "#/store/details?highlight=tax",
        },
        shouldRender: (state) => state.isAvailable,
        actions: {},
        queries: [
          { key: "plugins", selector: parsePluginStatus },
          { key: "onboarding", selector: wcTasksParser("tax") },
        ],
      },
      {
        name: "Add a product",
        text: __("Add a product", "wp-module-ecommerce"),
        state: {
          isActive: (queries) => queries?.plugins?.isWCActive,
          isCompleted: (queries) => queries?.products?.length > 0,
          url: () =>
            RuntimeSdk.adminUrl("post-new.php?post_type=product", true),
        },
        shouldRender: (state) => state.isActive,
        actions: {},
        queries: [
          { key: "plugins", selector: parsePluginStatus },
          { key: "products" },
        ],
      },
      {
        name: "Add a new page to your site",
        text: NewfoldRuntime.hasCapability("isEcommerce")
          ? __("Add a new page to your store", "wp-module-ecommerce")
          : __("Add a new page to your site", "wp-module-ecommerce"),
        state: {
          isCompleted: () =>
            pandora.get("nfd_ecommerce_onboarding_checklist", {})
              .add_new_page === "completed",
          url: () => RuntimeSdk.adminUrl("post-new.php?post_type=page", true),
        },
        shouldRender: () => true,
        actions: {
          manage: () => {
            pandora.set("nfd_ecommerce_onboarding_checklist", {
              ...pandora.get("nfd_ecommerce_onboarding_checklist", {}),
              add_new_page: "completed",
            });
          },
        },
        queries: [],
      },
      {
        name: "Upload media to your site",
        text: __("Upload media to your site", "wp-module-ecommerce"),
        state: {
          isCompleted: (queries) => queries?.media,
          url: () => "media-new.php",
        },
        shouldRender: () => true,
        actions: {
          manage: () => AnalyticsSdk.track("next_step", "next_step_add_media_clicked", data)
        },
        queries: [
          { key: "media", selector: mediaUploadedSelector() },
        ],
      },
      {
        name: "Connect to your social media accounts",
        text: __(
          "Connect to your social media accounts",
          "wp-module-ecommerce"
        ),
        state: {
          isCompleted: () =>
            pandora.get("nfd_ecommerce_onboarding_checklist", {})
              .connect_socials === "completed",
          isActive: (queries) => queries?.plugins?.isJetpackActive,
          url: () => RuntimeSdk.adminUrl("admin.php?page=jetpack#/sharing"),
        },
        shouldRender: (state) => state.isActive,
        actions: {
          manage: () => {
            pandora.set("nfd_ecommerce_onboarding_checklist", {
              ...pandora.get("nfd_ecommerce_onboarding_checklist", {}),
              connect_socials: "completed",
            });
          },
        },
        queries: [{ key: "plugins", selector: parsePluginStatus }],
      },
      {
        name: "Enable Jetpack to connect to your social media accounts",
        text: __(
          "Enable Jetpack to connect to your social media accounts",
          "wp-module-ecommerce"
        ),
        state: {
          isCompleted: (queries) => queries?.plugins?.isJetpackActive,
        },
        shouldRender: (state) => !state.isCompleted,
        actions: {
          manage: installJetpack,
        },
        queries: [{ key: "plugins", selector: parsePluginStatus }],
      },
    ],
  };
}
