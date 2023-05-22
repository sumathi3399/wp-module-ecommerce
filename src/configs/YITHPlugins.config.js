import { __ } from "@wordpress/i18n";
import { FeatureCard } from "../components/FeatureCard";
import { ReactComponent as Booking } from "../icons/booking.svg";
import { ReactComponent as CustomizeAccount } from "../icons/customize-account.svg";
import { ReactComponent as Filter } from "../icons/filter.svg";
import { ReactComponent as Gift } from "../icons/gift.svg";
import { ReactComponent as Search } from "../icons/search.svg";
import { ReactComponent as Store } from "../icons/store.svg";
import { ReactComponent as WishList } from "../icons/wishlist.svg";
import { queuePluginInstall } from "../services";

const YITHPlugins = ({ plugins, user, wpModules }) => {
  function defineFeatureState(yithId) {
    return {
      isActive: () => plugins.details?.[yithId].status === "active",
      isActionExternal: () => false,
      isDisabled: () => plugins.details?.woocommerce.status !== "active",
      isInstalling: () => plugins.queue?.some((queue) => queue.slug === yithId),
      isQueueEmpty: () => plugins.queue?.length === 0,
      isUpsellNeeded: () => !user?.capabilities.isEcommerce,
    };
  }
  return [
    {
      Card: FeatureCard,
      shouldRender: () => true,
      title: "nfd_slug_yith_woocommerce_booking",
      assets: () => ({
        image: Booking,
      }),
      text: ({ isActive }) => ({
        title: __("Manage bookable/rental products", "wp-module-ecommerce"),
        description: __(
          "Enable a booking/appointment system to manage renting or booking of services, rooms, houses.",
          "wp-module-ecommerce"
        ),
        actionName: isActive ? __("Manage") : __("Enable"),
        slug: "yith_wcbk_panel",
      }),
      state: defineFeatureState("nfd_slug_yith_woocommerce_booking"),
      actions: {
        buttonClick: async ({ isActive }) => {
          if (isActive) {
            window.location.href = "admin.php?page=yith_wcbk_panel";
          } else {
            let response = await queuePluginInstall(
              "nfd_slug_yith_woocommerce_booking",
              plugins.token,
              10
            );
            if (response === "failed") {
              let { notify } = wpModules;
              notify.push(
                "plugin-install-failure-nfd_slug_yith_woocommerce_booking",
                {
                  title: "Plugin failed to install",
                  description: (
                    <span>
                      {__("Please try again, or ", "wp-module-ecommerce")}
                      <a
                        href={user?.currentBrandConfig?.support}
                        target="_blank"
                      >
                        {__("contact support", "wp-module-ecommerce")}
                      </a>
                    </span>
                  ),
                  variant: "error",
                }
              );
            }
          }
        },
      },
      dataDependencies: [],
    },
    {
      Card: FeatureCard,
      shouldRender: () => true,
      title: "yith-woocommerce-ajax-search",
      assets: () => ({
        image: Search,
      }),
      text: ({ isActive }) => ({
        title: __(
          "Add a powerful search tool to your store",
          "wp-module-ecommerce"
        ),
        description: __(
          "Allow your users to search products in real time by title, description, tags, and more.",
          "wp-module-ecommerce"
        ),
        actionName: isActive ? "Manage" : "Enable",
        slug: "yith_wcas_panel",
      }),
      state: defineFeatureState("yith-woocommerce-ajax-search"),
      actions: {
        buttonClick: ({ isActive }) => {
          if (isActive) {
            window.location.href = "admin.php?page=yith_wcas_panel";
          } else {
            queuePluginInstall(
              "yith-woocommerce-ajax-search",
              plugins.token,
              11
            );
          }
        },
      },
      dataDependencies: [],
    },
    {
      Card: FeatureCard,
      shouldRender: () => true,
      title: "nfd_slug_yith_woocommerce_wishlist",
      assets: () => ({
        image: WishList,
      }),
      text: ({ isActive }) => ({
        title: __(
          "Allow your customers to save products in their Wishlist",
          "wp-module-ecommerce"
        ),
        description: __(
          "Make it easy for your customers to create lists and add their favorite items to them.",
          "wp-module-ecommerce"
        ),
        actionName: isActive ? "Manage" : "Enable",
        slug: "yith_wcwl_panel",
      }),
      state: defineFeatureState("nfd_slug_yith_woocommerce_wishlist"),
      actions: {
        buttonClick: ({ isActive }) => {
          if (isActive) {
            window.location.href = "admin.php?page=yith_wcwl_panel";
          } else {
            queuePluginInstall(
              "nfd_slug_yith_woocommerce_wishlist",
              plugins.token,
              12
            );
          }
        },
      },
      dataDependencies: [],
    },
    {
      Card: FeatureCard,
      shouldRender: () => true,
      title: "nfd_slug_yith_woocommerce_ajax_product_filter",
      assets: () => ({
        image: Filter,
      }),
      text: ({ isActive }) => ({
        title: __(
          "Add a powerful product filter to your store",
          "wp-module-ecommerce"
        ),
        description: __(
          "If your store has lots of products, help your customers find what they're looking for fast.",
          "wp-module-ecommerce"
        ),
        actionName: isActive ? "Manage" : "Enable",
        slug: "yith_wcan_panel",
      }),
      state: defineFeatureState(
        "nfd_slug_yith_woocommerce_ajax_product_filter"
      ),
      actions: {
        buttonClick: ({ isActive }) => {
          if (isActive) {
            window.location.href = "admin.php?page=yith_wcan_panel";
          } else {
            queuePluginInstall(
              "nfd_slug_yith_woocommerce_ajax_product_filter",
              plugins.token,
              13
            );
          }
        },
      },
      dataDependencies: [],
    },
    {
      Card: FeatureCard,
      shouldRender: () => true,
      title: "nfd_slug_yith_woocommerce_gift_cards",
      assets: () => ({
        image: Gift,
      }),
      text: ({ isActive }) => ({
        title: __("Sell Gift Cards in your store", "wp-module-ecommerce"),
        description: __(
          "Use gift cards to increase your earnings and attract new customers.",
          "wp-module-ecommerce"
        ),
        actionName: isActive ? "Manage" : "Enable",
        slug: "yith_woocommerce_gift_cards_panel",
      }),
      state: defineFeatureState("nfd_slug_yith_woocommerce_gift_cards"),
      actions: {
        buttonClick: ({ isActive }) => {
          if (isActive) {
            window.location.href =
              "admin.php?page=yith_woocommerce_gift_cards_panel";
          } else {
            queuePluginInstall(
              "nfd_slug_yith_woocommerce_gift_cards",
              plugins.token,
              14
            );
          }
        },
      },
      dataDependencies: [],
    },
    {
      Card: FeatureCard,
      shouldRender: () => true,
      title: "nfd_slug_yith_woocommerce_customize_myaccount_page",
      assets: () => ({
        image: CustomizeAccount,
      }),
      text: ({ isActive }) => ({
        title: __(
          "Customize your customers' account page",
          "wp-module-ecommerce"
        ),
        description: __(
          "Show any kind of custom content in your customers' account page.",
          "wp-module-ecommerce"
        ),
        actionName: isActive ? "Manage" : "Enable",
        slug: "yith_wcmap_panel",
      }),
      state: defineFeatureState(
        "nfd_slug_yith_woocommerce_customize_myaccount_page"
      ),
      actions: {
        buttonClick: ({ isActive }) => {
          if (isActive) {
            window.location.href = "admin.php?page=yith_wcmap_panel";
          } else {
            queuePluginInstall(
              "nfd_slug_yith_woocommerce_customize_myaccount_page",
              plugins.token,
              15
            );
          }
        },
      },
      dataDependencies: [],
    },
    {
      Card: FeatureCard,
      shouldRender: (state) => state.isAvailable,
      title: "nfd_slug_ecomdash_wordpress_plugin",
      assets: () => ({ image: Store }),
      text: ({ isActive }) => ({
        title: __(
          "Sell your products across multiple marketplaces",
          "wp-module-ecommerce"
        ),
        description: __(
          "Ecomdash is a multi-channel inventory control, listing, dropshipping and shipping management system.",
          "wp-module-ecommerce"
        ),
        actionName: isActive ? "Manage" : "Enable",
        slug: "nfd_slug_ecomdash_wordpress_plugin",
      }),
      state: defineFeatureState("nfd_slug_ecomdash_wordpress_plugin"),
      actions: {
        buttonClick: ({ isActive }) => {
          if (isActive) {
            window.location.href = "admin.php?page=newfold-ecomdash";
          } else {
            queuePluginInstall(
              "nfd_slug_ecomdash_wordpress_plugin",
              plugins.token,
              15
            );
          }
        },
      },
      dataDependencies: [],
    },
  ];
};

export default YITHPlugins;
