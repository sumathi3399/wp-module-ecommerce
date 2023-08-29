import { __ } from "@wordpress/i18n";
import { CheckboxGroup } from "@newfold/ui-component-library";
import { RuntimeSdk } from "../sdk/runtime";
import Razorpay from "./Razorpay";
import { Section } from "./Section";
import Paypal from "./Paypal";

const Payment = ({ notify, pushChanges, values, controls }) => {
  if (RuntimeSdk.brandSettings.setup.payment.length === 0) {
    return null;
  }
  return (
    <Section.Container>
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

      <Section.Content>
        <Section.Settings title={__("Offline Payments", "wp-module-ecommerce")}>
          <div className="nfd-border nfd-rounded-md nfd-p-6">
            <CheckboxGroup
              id="woocommerce_toggle_gateway_enabled"
              label={__("Manual Payment methods", "wp-module-ecommerce")}
              className="nfd-mt-4"
              description={__("When a customer selects a manual payment method, you'll need to approve their order before it can be fulfilled.", "wp-module-ecommerce")}
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
    </Section.Container>
  );
};

export default Payment;
