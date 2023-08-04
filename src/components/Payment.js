import { __ } from "@wordpress/i18n";
import { CheckboxGroup } from "@yoast/ui-library";
import { RuntimeSdk } from "../sdk/runtime";
import Razorpay from "./Razorpay";
import { Section } from "./Section";
import Stripe from "./stripe";
import Paypal from "./Paypal";

const Payment = ({ notify, pushChanges, values, controls }) => {
  if (RuntimeSdk.brandSettings.setup.payment.length === 0) {
    return null;
  }
  return (
    <Section.Content separator>
      {RuntimeSdk.brandSettings.setup.payment.includes("Paypal") && (
        <Section.Content separator>
          <Paypal notify={notify} />
        </Section.Content>
      )}

      {RuntimeSdk.brandSettings.setup.payment.includes("Razorpay") && (
        <Section.Content separator>
          <Razorpay notify={notify} />
        </Section.Content>
      )}

      {RuntimeSdk.brandSettings.setup.payment.includes("Stripe") && (
        <Section.Content separator>
          <Stripe notify={notify} />
        </Section.Content>
      )}

      <Section.Content>
        <Section.Settings title={__("Offline Payments", "wp-module-ecommerce")}>
          <div className="yst-border yst-rounded-md yst-p-6">
            <CheckboxGroup
              id="woocommerce_toggle_gateway_enabled"
              label="Manual Payment methods"
              className="yst-mt-4"
              description="When a customer selects a manual payment method, you'll need to approve their order before it can be fulfilled."
              name="woocommerce_toggle_gateway_enabled"
              disabled={controls.isLoading}
              onChange={pushChanges}
              options={[
                {
                  label: "Check payments",
                  value: "woocommerce_cheque_settings",
                },
                {
                  label: "Bank transfer payments",
                  value: "woocommerce_bacs_settings",
                },
                {
                  label: "Cash on delivery",
                  value: "woocommerce_cod_settings",
                },
              ]}
              values={values}
            />
          </div>
        </Section.Settings>
      </Section.Content>
    </Section.Content>
  );
};

export default Payment;
