/// <reference types="cypress" />
///<reference types="cypress-iframe" />

import 'cypress-iframe';

const dimensions = require('../fixtures/dimensions');

describe('Verify ', function () {
  Object.values(dimensions).map((key, index) => {
    let deviceName = Object.keys(dimensions)[index];

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
      cy.viewport(key.width, key.height);
      cy.visit('/wp-admin/admin.php?page=bluehost#/home/store');
      cy.injectAxe();
      cy.wait(2000);
    });

    it(`banner is displaying properly in ${deviceName}`, () => {
      cy.get('.nfd-ecommerce-banner')
        .invoke('outerWidth')
        .should('be.lt', key.width);
    });

    it(`all the required steps are displaying propely in ${deviceName}`, () => {
      cy.get('div.nfd-ecommerce-dashboard ul')
        .invoke('outerWidth')
        .should('be.lt', key.width);
    });

    it(`all store info cards are displaying properly in ${deviceName}`, () => {
      cy.findByText('Store Info').click();
      cy.get('[role="menu"]')
        .parent()
        .find('button')
        .eq(0)
        .should('have.text', 'Back');

      cy.get('button.nfd-ecommerce-card', { timeout: 50000 }).each(
        ($element) => {
          cy.wrap($element).should('have.css', 'position', 'static');
          cy.wrap($element.outerWidth()).and('be.lt', key.width);
        }
      );
    });

    it(`Store info fields are properly allign in ${deviceName}`, () => {
      cy.findByText('Store Info').click();
      cy.get('.nfd-ecommerce-card', { timeout: 10000 })
        .contains('Store Info')
        .click();

      cy.get('form>p').each(($element) => {
        expect($element.outerWidth()).to.be.lessThan(key.width);
        expect($element.css('position')).eq('static');
      });
      cy.get('input[name=woocommerce_store_address]')
        .should('have.css', 'position', 'static')
        .invoke('outerWidth')
        .should('be.lessThan', key.width);
      cy.get('[name=woocommerce_store_city]')
        .should('have.css', 'position', 'static')
        .invoke('outerWidth')
        .should('be.lessThan', key.width);
      cy.get('input[name=woocommerce_store_postcode]')
        .should('have.css', 'position', 'static')
        .invoke('outerWidth')
        .should('be.lessThan', key.width);
      cy.get('select[name=country]')
        .should('have.css', 'position', 'static')
        .invoke('outerWidth')
        .should('be.lessThan', key.width);
      cy.get('select[name=state]')
        .should('have.css', 'position', 'static')
        .invoke('outerWidth')
        .should('be.lessThan', key.width);
      cy.get('button[type=submit]')
        .should('have.css', 'background-color', 'rgb(25, 107, 222)')
        .invoke('outerWidth')
        .should('be.lessThan', key.width);
    });

    it(`store info are displaying properly in done state in ${deviceName}`, () => {
      cy.findByText('Store Info').click();
      cy.get('.nfd-ecommerce-card', { timeout: 10000 })
        .contains('Store Info')
        .click();
      cy.get('input[name=woocommerce_store_address]').type(
        this.data.store_address.address1
      );
      cy.get('[name=woocommerce_store_city]').type(
        this.data.store_address.city
      );
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

      cy.contains('Store Info', { timeout: 10000 })
        .parent()
        .find('.nfd-ecommerce-taskCompleted-image', { timeout: 10000 })
        .should('exist');

      cy.contains('Store Info')
        .parent()
        .should('have.css', 'position', 'static');

      cy.contains('Store Info')
        .parent()
        .invoke('outerWidth')
        .should('be.lt', key.width);
    });

    it(`Payments Card fields are properly allign in ${deviceName}`, () => {
      cy.contains('Store Info').click();
      cy.findByText('Payments', { timeout: 10000 }).click();
      cy.frameLoaded('iframe');
      cy.iframe()
        .find('.plugin-description')
        .invoke('outerWidth')
        .should('be.lt', key.width);
      cy.iframe()
        .find('div.yith-plugin-ui')
        .then(($element) => {
          var formWidth = $element.outerWidth();
          expect(formWidth).be.lessThan(key.width);
          expect($element.find('input:visible').outerWidth()).be.lessThan(
            formWidth
          );
          expect($element.find('p:visible').outerWidth()).be.lessThan(
            formWidth
          );
          $element.find('.description:visible').each((index) => {
            expect(
              $element.find('.description:visible').eq(index).outerWidth()
            ).to.be.lessThan(formWidth);
          });
          $element.find('label:visible').each((index) => {
            expect(
              $element.find('label:visible').eq(index).outerWidth()
            ).to.be.lessThan(formWidth);
          });
        });
    });

    it(`Shipping fields are properly allign in ${deviceName}`, () => {
      cy.contains('Store Info').click();
      cy.findByText('Shipping', { timeout: 10000 }).click();
      cy.frameLoaded('iframe');
      cy.iframe()
        .find('.plugin-description')
        .invoke('outerWidth')
        .should('be.lt', key.width);
      cy.iframe()
        .find('div.yith-plugin-ui')
        .then(($element) => {
          var formWidth = $element.outerWidth();
          expect(formWidth).be.lessThan(key.width);
          expect($element.find('input:visible').outerWidth()).be.lessThan(
            formWidth
          );
          expect($element.find('p:visible').outerWidth()).be.lessThan(
            formWidth
          );
          $element.find('.description:visible').each((index) => {
            expect(
              $element.find('.description:visible').eq(index).outerWidth()
            ).to.be.lessThan(formWidth);
          });
          $element.find('label:visible').each((index) => {
            expect(
              $element.find('label:visible').eq(index).outerWidth()
            ).to.be.lessThan(formWidth);
          });
        });
    });

    it(`Tax info cards fields are properly allign in ${deviceName}`, () => {
      cy.contains('Store Info').click();
      cy.findByText('Tax Info', { timeout: 10000 }).click();

      cy.get('[role="document"] p').then(($para, index) => {
        for (let index = 0; index < $para.length; index++) {
          if (index != 2) {
            expect($para.css('text-align')).to.be.eq('center');
          }
          expect($para.css('text-overflow')).to.be.eq('clip');
        }
      });

      cy.get('[role="button"]').each(($option) => {
        expect($option.css('text-align')).to.be.eq('start');
        expect($option.outerWidth()).to.lessThan(key.width);
      });

      cy.contains('Continue').then(($submit) => {
        cy.log($submit.css('position'));
        expect($submit.css('text-align')).to.be.eq('center');
      });
    });

    it.only(`Product and Services cards are displaying properly in ${deviceName}`, () => {
      cy.findByText('Products and Services').click();

      cy.get('button.nfd-ecommerce-card', { timeout: 50000 }).each(
        ($element) => {
          cy.wrap($element).invoke('outerWidth').should('be.lt', key.width);
          cy.wrap($element).should('have.css', 'position', 'static');

          cy.wrap($element.find('span'))
            .invoke('outerWidth')
            .should('be.lt', $element.outerWidth());

          cy.get('.nfd-ecommerce-card-title').each((title, index) => {
            if (title.text().includes('How to add products')) {
              cy.wrap(title.css('text-align')).should('eq', 'left');
            } else {
              cy.wrap(title.css('text-align')).should('eq', 'center');
            }
          });
        }
      );

      cy.get('button.nfd-ecommerce-card', { timeout: 50000 })
        .contains('Add a Product')
        .click();
      cy.findByText('Physical product', {
        timeout: 50000,
      }).click();
      cy.get('[name="post_title"]').type('First Product');
      cy.get('#publish').click();
      cy.go('back');
      cy.go('back');
      cy.reload();

      cy.get('button.nfd-ecommerce-card', { timeout: 50000 }).each(
        ($element) => {
          cy.wrap($element).invoke('outerWidth').should('be.lt', key.width);
          cy.wrap($element).should('have.css', 'position', 'static');

          cy.wrap($element.find('span'))
            .invoke('outerWidth')
            .should('be.lt', $element.outerWidth());
          cy.wrap($element.find('span').css('text-align')).should('eq', 'left');
        }
      );
    });

    it(`Pages cards are displaying properly in ${deviceName}`, () => {
      cy.get('[role="menu"]')
        .findByText('Pages')
        .invoke('outerWidth')
        .should('be.lt', key.width);

      cy.get('[role="menu"]').findByText('Pages').findByText('Pages').click();
      cy.get('[role="menu"]')
        .parent()
        .find('button')
        .eq(0)
        .should('have.text', 'Back');

      cy.get('span.nfd-ecommerce-dashboard-subtitle')
        .invoke('outerWidth')
        .should('be.lt', key.width);
      cy.get('button.nfd-ecommerce-card', { timeout: 50000 }).each(
        ($element) => {
          cy.wrap($element).invoke('outerWidth').should('be.lt', key.width);
          cy.wrap($element).should('have.css', 'position', 'static');

          cy.wrap($element.find('span'))
            .invoke('outerWidth')
            .should('be.lt', $element.outerWidth());
          cy.wrap($element.find('span').css('text-align')).should(
            'eq',
            'center'
          );
        }
      );
    });

    it(`Additional Features Cards are displaying properly in ${deviceName}`, () => {
      cy.findByText('Additional Features').click();
      cy.get('[role="menu"]')
        .parent()
        .find('button')
        .eq(0)
        .should('have.text', 'Back');

      cy.get('span.nfd-ecommerce-dashboard-subtitle')
        .invoke('outerWidth')
        .should('be.lt', key.width);
      cy.get('button.nfd-ecommerce-card', { timeout: 50000 }).each(
        ($element) => {
          cy.wrap($element).invoke('outerWidth').should('be.lt', key.width);
          cy.wrap($element).should('have.css', 'position', 'static');

          cy.wrap($element.find('span'))
            .invoke('outerWidth')
            .should('be.lt', $element.outerWidth());
          cy.wrap($element.find('span').css('text-align')).should('eq', 'left');
        }
      );
    });
  });
});
