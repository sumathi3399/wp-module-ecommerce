/// <reference types="cypress" />
///<reference types="cypress-iframe" />

import 'cypress-iframe';

const customCommandTimeout = 10000;
var homeUrl = '/wp-admin/admin.php?page=bluehost#/home/store/general';

describe('As a wp-admin user, I want to ', function () {
  before(() => {
    cy.fixture('homePageUserInputData').then((data) => {
      this.data = data;
    });
    cy.activatePlugin('all');
    cy.deleteALLTaxRates();
    cy.deleteAllProducts();
    cy.deleteAllPages();
    cy.resetGeneralSettingTabs();
  });

  beforeEach(() => {
    cy.visit(homeUrl);
    cy.injectAxe();
    cy.contains('Tax Info', { timeout: 30000 });
  });

  it('verify "WooCommerce is not installed!" model displaying when WooCommerce plugin is not install or active', () => {
    cy.deactivatePlugin('woocommerce');
    cy.reload();
    cy.contains('Uh-Oh! WooCommerce is not installed!', {
      timeout: customCommandTimeout,
    }).should('exist');
    cy.contains(
      'WooCommerce is required for this dashboard to work, install it now or contact our support team for more assistance.'
    ).should('exist');
    cy.contains('Install WooCommerce').should('exist');
    cy.contains('Contact Support').should('exist');
    const urlToVerify = 'https://www.bluehost.com/contact';
    cy.window().then((win) => {
      cy.stub(win, 'open')
        .as('windowOpen')
        .callsFake(() => {});
    });
    cy.contains('Contact Support').click();
    cy.get('@windowOpen').should('be.calledWith', urlToVerify, '_blank');
    cy.activatePlugin('woocommerce');
  });

  it('verify the launch pad banner on top of the home page when site status is not live', () => {
    cy.enableComingSoon();
    cy.get('div.nfd-ecommerce-banner', { timeout: customCommandTimeout }).as(
      'homePageBanner'
    );
    cy.reload();
    cy.get('@homePageBanner')
      .find('h1')
      .contains('Congrats on your new store!');

    cy.get('@homePageBanner')
      .find('span.status-notice')
      .contains(
        "You're just a few steps away from sharing your site with the world!"
      );
  });

  it('verify the launch pad banner on top of the home page when site status is live', () => {
    cy.contains('Launch your store').click();
    cy.contains('Continue').click();
    cy.get('div.nfd-ecommerce-banner').as('homePageBanner');
    cy.get('@homePageBanner')
      .find('h1')
      .contains('Ready to go to the next level?');
    cy.get('@homePageBanner')
      .find('span.status-notice')
      .contains(
        "Increase your store's performance by helping people find your store and engaging more with them once they have."
      );
  });

  it('see all 4 vertical tabs on Home Page', () => {
    const tabList = [
      'Store Info',
      'Products and Services',
      'Pages',
      'Additional Features',
    ];
    tabList.forEach((element) => {
      cy.get('[aria-label="Setup Guide"]').find('a>li').contains(element);
    });
  });

  it('see Store Info, Payments, Shipping and Tax info cards in General Setting tab', () => {
    const cardList = ['Store Info', 'Payments', 'Shipping', 'Tax Info'];
    cy.get('button.nfd-ecommerce-card')
      .as('uncompletedCard')
      .each(($element, index) => {
        cy.wrap($element).find('span').should('include.text', cardList[index]);
      });

    const linkTextList = ['Add Info', 'Setup', 'Setup', 'Add Info'];
    cy.get('@uncompletedCard')
      .find('span>span')
      .each(($el, index) => {
        cy.wrap($el).should('include.text', linkTextList[index]);
      });
  });

  it('add my Store address from "General Setting" "Store Info" card', () => {
    cy.get('button.nfd-ecommerce-card')
      .as('uncompletedCard')
      .find('.nfd-ecommerce-card-title')
      .contains('Store Info')
      .click();

    cy.get('input[name=woocommerce_store_address]').type(
      this.data.store_address.address1
    );
    cy.get('[name=woocommerce_store_city]').type(this.data.store_address.city);
    cy.get('input[name=woocommerce_store_postcode]').type(
      this.data.store_address.zipcode
    );
    cy.get('select[name=country]').select(this.data.store_address.country);
    cy.get('select[name=state]').select(this.data.store_address.state);
    cy.get('[name=woocommerce_email_from_address]').type(
      this.data.store_address.email
    );
    cy.get('[name=woocommerce_currency]').select(
      this.data.store_address.currency
    );
    cy.get('button[type=submit]').click();

    cy.get('.task-status-indicator', {
      timeout: customCommandTimeout,
    }).should('be.visible');
    cy.reload();
    cy.get('.task-status-indicator', {
      timeout: customCommandTimeout,
    })
      .parent()
      .find('.nfd-ecommerce-card-title')
      .contains('Store Info')
      .click();

    cy.get('input#woocommerce_store_address', {
      timeout: customCommandTimeout,
    }).should('have.value', this.data.store_address.address1);
    cy.get('input#woocommerce_store_city').should(
      'have.value',
      this.data.store_address.city
    );
    cy.get('select[name=woocommerce_default_country] option:selected').should(
      'have.text',
      `${
        this.data.store_address.country + ' — ' + this.data.store_address.state
      }`
    );
    cy.get('input#woocommerce_store_postcode').should(
      'have.value',
      this.data.store_address.zipcode
    );
  });

  it('see the option to link my existing payment method in General Setting', () => {
    cy.get('button.nfd-ecommerce-card')
      .find('.nfd-ecommerce-card-title')
      .contains('Payments')
      .click();
    cy.frameLoaded('iframe');

    cy.iframe().contains('Title').parent().parent().find('input').clear();
    cy.iframe().find('[data-type=radio] label').as('paypalRadioButtons');
    if (this.data.existing_payment.environment === 'sandbox') {
      cy.get('@paypalRadioButtons').eq(1).click();
    } else {
      cy.get('@paypalRadioButtons').eq(0).click();
    }
    if (
      this.data.existing_payment.payment_action.toLowerCase().includes('sale')
    ) {
      cy.get('@paypalRadioButtons').eq(2).click();
    } else {
      cy.get('@paypalRadioButtons').eq(3).click();
    }
    cy.iframe().find('button#yith-bh-save-button').click();
  });

  it('verify a model is displaying when "YITH PayPal Payments" plugin is not installed', () => {
    cy.deactivatePlugin('yith-paypal-payments-for-woocommerce-extended');
    cy.reload();
    cy.get('button.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Payments')
      .click();
    cy.get('[role=document] h1')
      .should('exist')
      .and('contain.text', 'Hold tight...');
  });

  it('verify a model is displaying when "YITH Shippo" plugin is not installed', () => {
    cy.deactivatePlugin('yith-shippo-shippings-for-woocommerce-extended');
    cy.reload();
    cy.get('button.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Shipping')
      .click();
    cy.get('[role=document] h1')
      .should('exist')
      .and('contain.text', 'Hold tight...');
  });

  it('link my existing shippo account in General Setting', () => {
    cy.activatePlugin('yith-shippo-shippings-for-woocommerce-extended');
    cy.reload();
    cy.get('button.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Shipping')
      .click();
    cy.frameLoaded('iframe');

    cy.log('link Shipping Account');
    cy.iframe().find('[data-type=radio] label').as('shippoRadioButtonList');
    if (
      this.data.existing_shipping.environment.toLowerCase().includes('sandbox')
    ) {
      cy.get('@shippoRadioButtonList').eq(1).click();
    } else {
      cy.get('@shippoRadioButtonList').eq(0).click();
    }
    cy.iframe()
      .find('input#yith_shippo_sandbox_token')
      .clear()
      .type(this.data.existing_shipping.test_api);

    cy.iframe()
      .contains('Name')
      .parent()
      .find('input[type=text]')
      .clear()
      .type(this.data.existing_shipping.sender_name);

    cy.iframe()
      .contains('Company')
      .parent()
      .find('input')
      .clear()
      .type(this.data.existing_shipping.sender_company);

    cy.iframe()
      .contains('Email')
      .parent()
      .find('input')
      .clear()
      .type(this.data.existing_shipping.email);

    if (this.data.existing_shipping.use_woocommerce_address) {
      cy.iframe()
        .find('[type=checkbox]')
        .then(($element) => {
          if (!$element.is(':checked')) {
            cy.wrap($element).check();
          }
        });
    }
    cy.iframe().contains('Save').click();

    cy.log('check shipping is in done state');
    cy.reload();
    cy.get('.task-status-indicator', {
      timeout: customCommandTimeout,
    })
      .parent()
      .contains('Shipping')
      .click();

    cy.log('Verify data provided entered correctly into Yith Shippo plugin');
    cy.wait(5000);
    cy.get('body').then(($body) => {
      if ($body.find('.yith-icon-close').length != 0) {
        cy.get('.yith-icon-close').click();
      }
    });
    cy.get('body').type('{esc}');
    cy.get('input[type=radio][checked=checked]', {
      timeout: customCommandTimeout,
    }).should('include.value', this.data.existing_shipping.environment);
    cy.get('#yith_shippo_sandbox_token').should(
      'have.value',
      this.data.existing_shipping.test_api
    );
    cy.contains('Shipping Settings').click({ force: true });
    cy.wait(2000);
    cy.get('body').then(($body) => {
      if ($body.find('.yith-icon-close').length != 0) {
        cy.get('.yith-icon-close').click();
      }
    });

    cy.get('#yith-shippo-sender-info-name').should(
      'have.value',
      this.data.existing_shipping.sender_name
    );
    cy.get('#yith-shippo-sender-info-company').should(
      'have.value',
      this.data.existing_shipping.sender_company
    );
    cy.get('#yith-shippo-sender-info-email').should(
      'have.value',
      this.data.existing_shipping.email
    );
  });

  it('select, "I dont charge sales taxes"', () => {
    cy.get('button.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Tax Info')
      .click();
    cy.get('div.nfd-ecommerce-modal-option', { timeout: customCommandTimeout })
      .contains("I don't charge sales tax")
      .click();
    cy.contains('Continue').click();
    cy.wait(3000);
    cy.reload();
    cy.get('.task-status-indicator', {
      timeout: customCommandTimeout,
    })
      .parent()
      .find('.nfd-ecommerce-card-title')
      .contains('Tax Info', {
        timeout: customCommandTimeout,
      })
      .should('exist');
    cy.exec('npx wp-env run cli wp option delete woocommerce_calc_taxes');
    cy.exec('npx wp-env run cli wp option delete woocommerce_no_sales_tax');
    cy.reload();
    cy.contains('Tax Info', { timeout: customCommandTimeout });
  });

  it('configure "Yes, enable tax rates and calculations" from "General setting" "Tax Info" card', () => {
    cy.get('button.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Tax Info')
      .click();
    cy.get('div.nfd-ecommerce-modal-option')
      .contains('Yes, enable tax rates and calculations')
      .click();
    cy.contains('Continue').click();
    cy.wait(3000);
    cy.reload();
    cy.get('.task-status-indicator', {
      timeout: customCommandTimeout,
    })
      .parent()
      .should((completedCards) => {
        expect(completedCards).to.include.text('Tax Info');
      });
    cy.contains('Tax Info').click();

    cy.get('form#mainform>nav>a').should((completedCards) => {
      expect(completedCards).to.include.text('Tax');
    });

    cy.log('Add a standard rate');
    cy.contains('Standard rates').click();
    cy.get('a.button.plus.insert').click();
    cy.get('td.country').then(($element) => {
      const count = $element.length;
      cy.get('td.country')
        .eq(count - 1)
        .find('input')
        .type(this.data.standard_tax_setting.country_code);
      cy.get('td.state')
        .eq(count - 1)
        .find('input')
        .type(this.data.standard_tax_setting.state_code);
      cy.get('td.rate')
        .eq(count - 1)
        .find('input')
        .type(this.data.standard_tax_setting.rate_percentage);
      if (this.data.standard_tax_setting.apply_to_shipping === true) {
        cy.get('td.apply_to_shipping')
          .find('input')
          .eq(count - 1)
          .click();
      }
      cy.get('button[name=save]').click();
    });
  });

  it('see "Add a product" and "Import Product" cards in Your Product tab', () => {
    cy.contains('Products and Services').click();
    ['Add a Product', 'Import Products'].forEach((card) => {
      cy.contains(card);
    });
  });

  it('Add a Product from "Your product" tabs', () => {
    cy.contains('Products and Services').click();
    cy.get('button.nfd-ecommerce-card').contains('Add a Product').click();
    cy.get('[name=post_title]', { timeout: customCommandTimeout }).type(
      this.data.simple_product_details.name
    );
    cy.get('body').then(($body) => {
      if ($body.find('[aria-label="Close Tour"]').length !== 0) {
        cy.get('[aria-label="Close Tour"]').click();
      }
    });
    cy.get('select#product-type').select('Simple product');
    cy.get('[name=_regular_price]').type(
      this.data.simple_product_details.regular_price
    );
    cy.get('[name=_sale_price]').type(
      this.data.simple_product_details.sale_price
    );
    cy.contains('Inventory').parent().click();

    cy.get('[name=_sku]').type(this.data.simple_product_details.sku);

    cy.get('[name=_manage_stock]').click();
    cy.get('[name=_stock]').type(
      this.data.simple_product_details.stock_quantity
    );
    cy.get('[name=_low_stock_amount]').type(
      this.data.simple_product_details.low_stock_threshold
    );

    cy.get('a[href="#product_cat-add"]').click();
    cy.get('[value="New category name"]')
      .eq(0)
      .type(this.data.simple_product_details.category);
    cy.get('[value="Add new category"]').eq(0).click();
    cy.get('#product_catchecklist')
      .contains(this.data.simple_product_details.category.toString())
      .find('input')
      .then(($element) => {
        if ($element.prop('checked') === false) {
          cy.wrap($element).check();
        }
      });

    cy.get('input#new-tag-product_tag').type(
      this.data.simple_product_details.tags
    );
    cy.get('[value=Add]').click();

    cy.get('[name=publish]').click();
    cy.visit(homeUrl);
    cy.contains('Products and Services', { timeout: 10000 }).click();
    cy.contains('Manage Products', { timeout: 15000 }).should('exist');
  });

  it('Verify Manage Products, Import Products cards is visible after adding a product', () => {
    cy.contains('Products and Services').click();
    cy.contains('Manage Products', { timeout: customCommandTimeout });
    ['Manage Products', 'Import Products'].forEach((card) => {
      cy.contains(card);
    });
  });

  it("verify 'Manage Products', 'Import Products' redirecting to right page after click", () => {
    cy.contains('Products and Services').click();

    cy.get('button.nfd-ecommerce-card', {
      timeout: customCommandTimeout,
    })
      .as('Cards')
      .contains('Manage Products')
      .click();
    cy.get('.wp-heading-inline').contains('Products');
    cy.get('.page-title-action').should('exist');
    cy.go('back');

    cy.get('@Cards').contains('Import Products').click();
    cy.contains('Import products from a CSV file').should('exist');
  });

  it('import product from external file', () => {
    cy.deleteAllProducts();
    cy.reload();
    cy.contains('Products and Services', {
      timeout: customCommandTimeout,
    }).click();
    cy.get('button.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Import Products')
      .click();
    cy.get('[name=import]').selectFile(
      './tests/cypress/fixtures/WCProductList.csv'
    );
    cy.get('[value="Continue"]').click();
    cy.get('[value="Run the importer"]', {
      timeout: customCommandTimeout,
    }).click();
    cy.get('section.woocommerce-importer-done', {
      timeout: 30000,
    }).should('exist');
    cy.contains('View products').should('exist');
  });

  it('verify Gift & Booking card is visible when plugin is installed', () => {
    Cypress.on('uncaught:exception', () => {
      /*
      Returning false here to prevents Cypress from failing the test Because Getting
      Application Error: Cannot read properties of null (reading 'addEventListener')
      */
      return false;
    });

    cy.contains('Additional Features').click();
    cy.log('Mocking `**status&_locale=user` API response');
    cy.intercept('GET', '**status&_locale=user', {
      fixture: 'additionalFeature.json',
    });
    cy.reload();
    cy.contains('Products and Services', {
      timeout: customCommandTimeout,
    }).click();
    cy.get('.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Gift')
      .should('exist');
    cy.get('.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Booking')
      .should('exist');
  });

  it('verify Gift & Booking card is not visible when plugin is not installed', () => {
    Cypress.on('uncaught:exception', () => {
      /*
      Returning false here to prevents Cypress from failing the test Because Getting
      Application Error: Cannot read properties of null (reading 'addEventListener')
      */
      return false;
    });

    cy.contains('Additional Features').click();
    cy.fixture('additionalFeature.json').then((file) => {
      file.status.yith_woocommerce_gift_cards_panel = 'Not Installed';
      file.status.yith_wcbk_panel = 'Not Installed';
      cy.log('Mocking `**status&_locale=user` API response');
      cy.intercept('GET', '**status&_locale=user', file);
    });
    cy.reload();
    cy.contains('Products and Services', {
      timeout: customCommandTimeout,
    }).click();
    cy.get('.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Gift')
      .should('not.exist');
    cy.get('.nfd-ecommerce-card', { timeout: customCommandTimeout })
      .contains('Booking')
      .should('not.exist');
  });

  it('create , edit, and manage gift card', () => {
    cy.contains('Products and Services').click();
    cy.get('.nfd-ecommerce-card-title', { timeout: customCommandTimeout })
      .contains('Create a Gift Card')
      .click();
    cy.get('[name=post_title]', { timeout: customCommandTimeout })
      .clear()
      .type('Birthday Card');
    cy.get('select#product-type option:selected').should(
      'have.text',
      'Gift card'
    );
    cy.get('input#publish').click();
    cy.visit('/wp-admin/admin.php?page=bluehost#/home/store/products');
    cy.get('.nfd-ecommerce-card-title', { timeout: customCommandTimeout })
      .contains('Manage Gift Cards')
      .click();
    cy.get('button[role="menuitem"]', { timeout: customCommandTimeout })
      .as('menu')
      .should('have.length', 3);

    let menuList = [
      'Create a gift card',
      'View/Edit a gift card',
      'Manage gift card settings',
    ];

    cy.get('@menu').eq(0).scrollIntoView();
    cy.get('@menu').each(($el, index, $list) => {
      cy.wrap($el).should('have.text', menuList[index]);
    });

    cy.get('@menu').eq(0).scrollIntoView();
    cy.get('@menu')
      .findByText('Create a gift card')
      .click({ waitForAnimations: false });
    cy.get('select#product-type option:selected').should(
      'have.text',
      'Gift card'
    );
    cy.go('back');

    cy.get('.nfd-ecommerce-card-title', { timeout: customCommandTimeout })
      .contains('Manage Gift Cards')
      .click();

    cy.get('@menu').eq(0).scrollIntoView();
    cy.get('@menu')
      .contains('View/Edit a gift card')
      .click({ waitForAnimations: false });
    cy.url().should(
      'eq',
      Cypress.config().baseUrl + '/wp-admin/edit.php?post_type=product'
    );
    cy.go('back');

    cy.get('.nfd-ecommerce-card-title', { timeout: customCommandTimeout })
      .contains('Manage Gift Cards')
      .click();
    cy.get('@menu').eq(0).scrollIntoView();
    cy.get('@menu')
      .contains('Manage gift card settings')
      .click({ waitForAnimations: false });
    cy.url().should('include', 'edit.php?post_type=gift_card&yith-plugin');
  });

  it('create , edit, and manage booking card', () => {
    cy.contains('Products and Services').click();
    cy.get('.nfd-ecommerce-card-title', { timeout: customCommandTimeout })
      .contains('Setup Bookings')
      .click();
    cy.get('[name=post_title]', { timeout: customCommandTimeout })
      .clear()
      .type('My Booking');
    cy.get('select#product-type').select('Bookable Product');
    cy.get('input#publish').click();
    cy.visit('/wp-admin/admin.php?page=bluehost#/home/store/products');
    cy.wait(5000);
    cy.get('.nfd-ecommerce-card-title', { timeout: customCommandTimeout })
      .contains('Manage Bookings', { timeout: customCommandTimeout })
      .click();
    cy.findByText('YITH Booking and Appointment for WooCommerce').should(
      'exist'
    );
  });

  it("verify 'How to add product' card exist", () => {
    const urlToVerify = 'https://woocommerce.com/document/managing-products/';

    cy.contains('Products and Services').click();
    cy.window().then((win) => {
      cy.stub(win, 'open')
        .as('windowOpen')
        .callsFake(() => {});
    });

    cy.get('button.nfd-ecommerce-card').contains('How to add products').click();

    cy.get('@windowOpen').should('be.calledWith', urlToVerify, '_blank');
  });

  it('Verify Add a Page card exist when yith-wonder theme is not installed', () => {
    cy.get('a > li').contains('Pages').click();
    cy.exec('npx wp-env run cli wp theme activate twentytwentythree');
    cy.reload();
    cy.findByText('Add a Page', { timeout: customCommandTimeout }).should(
      'exist'
    );
  });

  it('verify "Pages" cards exist', () => {
    cy.exec('npx wp-env run cli wp theme install yith-wonder --activate');
    cy.reload();
    cy.get('a > li').contains('Pages').click();
    [
      'Home Page',
      'About Page',
      'Contact Page',
      'Store Layout',
      'Customer Account Page',
    ].forEach((element) => {
      cy.contains(element);
    });
  });

  it('create home page, about page, contact page', () => {
    cy.get('a > li').contains('Pages').click();
    cy.log('Create HomePage');
    cy.contains('Home Page').click();
    cy.contains('Homepage').should('exist');
    cy.get('button').contains('Publish').click({ force: true });
    cy.get('div.editor-post-publish-panel')
      .find('button')
      .contains('Publish')
      .click({ force: true });
    cy.contains('is now live.', { timeout: 20000 });
    cy.contains('Back').click();

    cy.log('Create About Page');
    cy.contains('About Page', { timeout: customCommandTimeout }).click();
    cy.contains('About Us').should('exist');
    cy.get('button').contains('Publish').click({ force: true });
    cy.get('div.editor-post-publish-panel')
      .find('button')
      .contains('Publish')
      .click({ force: true });
    cy.contains('is now live.', { timeout: 20000 });
    cy.contains('Back').click();

    cy.log('Create Contact Page');
    cy.contains('Contact Page', {
      timeout: customCommandTimeout,
    }).click();
    cy.contains('Contact Us').should('exist');
    cy.get('button').contains('Publish').click({ force: true });
    cy.get('div.editor-post-publish-panel').find('button').contains('Cancel');
    cy.get('div.editor-post-publish-panel')
      .find('button')
      .contains('Publish')
      .click({ force: true });
    cy.contains('is now live.', { timeout: 20000 });
    cy.contains('Back').click();
  });

  it('change my store layout', () => {
    Cypress.on('uncaught:exception', () => {
      /*
      Returning false here to prevents Cypress from failing the test Because Getting
      Application Error: Cannot read properties of null (reading 'addEventListener')
      */
      return false;
    });
    cy.get('a > li').contains('Pages').click();
    cy.contains('Store Layout').click();
    cy.contains('Site Identity').click();
    cy.contains('Site Title')
      .parent()
      .find('input')
      .click()
      .clear()
      .type('beyond');
    cy.get('[name=save]').click();
    cy.get('[name=save]').should('be.disabled');
  });

  it('go to "WooCommerce Customize My Account Page"', () => {
    cy.get('a > li').contains('Pages').click();
    cy.contains('Customer Account Page').click();
    cy.contains('YITH WooCommerce Customize My Account Page').should('exist');
  });

  it('check the additional feature exist', () => {
    Cypress.on('uncaught:exception', () => {
      /*
      Returning false here to prevents Cypress from failing the test Because Getting
      Application Error: Cannot read properties of null (reading 'addEventListener')
      */
      return false;
    });
    const freeAddOns = [
      'Add a powerful search tool to your store',
      'Allow your customers to save products in their Wishlist',
      'Add a powerful product filter to your store',
      'Sell Gift Cards in your store',
      "Customize your customers' account page",
      'Manage bookable/rental products',
    ];

    cy.contains('Additional Features').click();
    cy.log('Mocking `**status&_locale=user` API response');
    cy.intercept('GET', '**status&_locale=user', {
      fixture: 'additionalFeature.json',
    });
    cy.reload();

    cy.get('.nfd-ecommerce-card')
      .find('.nfd-ecommerce-card-action button')
      .each(($addons) => {
        cy.wrap($addons).should('have.text', 'Manage');
      });
  });

  it('Launch My Store', () => {
    cy.enableComingSoon();
    cy.reload();

    cy.get('div.site-status-banner', { timeout: customCommandTimeout }).then(
      ($element) => {
        cy.wrap($element.find('h2').text()).should('eq', 'Ready to go live?');
        cy.wrap($element.find('p').text()).should(
          'eq',
          "Preview your store before setting it live to make sure everything is how you want it. Once you're ready, set your store live!"
        );

        cy.contains('Launch your store').click();
        cy.contains('Continue').click();
      }
    );

    cy.get('.nfd-ecommerce-store-analytics').as('analytics');
    cy.get('@analytics').find('h2').should('have.text', 'Store Analytics');
    cy.get('@analytics')
      .find('.store-analytics-notice')
      .should(
        'have.text',
        'Get a detailed view of all your store performance analytics via the WooCommerce Analytics page.'
      );
    cy.get('@analytics').find('a').should('have.text', 'View Analytics');
  });
});
