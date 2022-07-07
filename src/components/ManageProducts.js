import useSWR from "swr";
import { ReactComponent as AddProducts } from "../icons/add-products.svg";
import { ReactComponent as ImportProducts } from "../icons/import-products.svg";
import { ReactComponent as Help } from "../icons/help.svg";
import { Card } from "./Card";
import { DashboardContent } from "./DashboardContent";

const ManageProductsList = [
  {
    title: "Add a product",
    action: "Add new",
    actionUrl: "/wp-admin/post-new.php?post_type=product",
  },
  {
    title: "Manage products",
    action: "View all",
    actionUrl: "/wp-admin/edit.php?post_type=product",
  },
  {
    title: "Categories",
    action: "Manage",
    actionUrl: "/wp-admin/edit-tags.php?taxonomy=product_cat&post_type=product",
  },
  {
    title: "Tags",
    action: "Manage",
    actionUrl: "/wp-admin/edit-tags.php?taxonomy=product_tag&post_type=product",
  },
];

export function ManageProducts(props) {
  let { wpModules } = props;
  const fetcher = (path) => wpModules.apiFetch({ path });
  let { data: productsResponse } = useSWR("/wc/v3/products", fetcher);

  if (!productsResponse) {
    return (
      <div style={{ height: "100%", display: "grid", placeContent: "center" }}>
        <div className="bwa-loader" />
      </div>
    );
  }

  return (
    <>
      {productsResponse.length == 0 ? (
        <DashboardContent
          title="Add Products"
          subtitle="Come here to manage your products or add new ones to your store."
        >
          <div className="nfd-ecommerce-standard-actions-container">
            <Card
              variant="standard"
              title="Add Products"
              action="Add"
              href="/wp-admin/post-new.php?post_type=product"
            >
              <AddProducts />
            </Card>
            <Card
              variant="standard"
              title="Import Products"
              action="Import"
              href="/wp-admin/edit.php?post_type=product&page=product_importer"
            >
              <ImportProducts />
            </Card>
          </div>
        </DashboardContent>
      ) : (
        <DashboardContent
          title="Your Products"
          subtitle="Come here to manage your products or add new ones to your store."
        >
          <div className="nfd-ecommerce-minimal-tasks-container">
            {ManageProductsList.map((card) => (
              <Card
                variant="minimal"
                title={card.title}
                action={card.action}
                href={card.actionUrl}
              ></Card>
            ))}
          </div>
        </DashboardContent>
      )}
      <div style={{ height: "40px" }} />
      <DashboardContent
        title="First time adding a product?"
        subtitle="Read this helpful knowledge base article to understand how to add different products to your store."
      >
        <div className="nfd-ecommerce-minimal-tasks-container">
          <Card
            variant="minimal"
            title="How to add products"
            action="Learn More"
            href="/wp-admin/edit.php?post_type=product&page=product_importer"
          >
            <Help />
          </Card>
        </div>
      </DashboardContent>
    </>
  );
}
