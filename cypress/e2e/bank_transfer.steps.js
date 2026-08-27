import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { convertDate } from "../support/utils";

const SUCCESS_MESSAGE = "Transfer created successfully";


const TransferPage = () => {
  cy.visit("/transfer");
};
Given("I am logged in as {string}", (role) => {
  cy.loginAs(role);
});
Given("I am on the bank transfer page", TransferPage);

When("I open the bank transfer page", TransferPage);

Then("the transfer creation is {string}", (access) => {
  const cta = "[data-testid='create-transfer-button']";
  if (access === "allowed") {
    cy.get(cta).should("be.visible");
  } else {
    cy.get(cta).should("not.exist");
  }
});

When("I fill the form with the {string} dataset {string}", (category, dataset) => {
  cy.fixture("transfer_data").then((data) => {
    const dataValue = data[category][dataset];
    if (dataValue.beneficiary_name) {
      cy.get("[data-testid='transfer-beneficiary-input']").clear().type(dataValue.beneficiary_name);
    }
    if (dataValue.iban) {
      cy.get("[data-testid='transfer-iban-input']").clear().type(dataValue.iban);
    }
    // Test explicite (et non un simple `if (amount)`) pour ne pas ignorer 0,
    // qui est une valeur limite legitime (amount_below_min).
    if (dataValue.amount !== null && dataValue.amount !== undefined && dataValue.amount !== "") {
      cy.get("[data-testid='transfer-amount-input']").clear().type(String(dataValue.amount));
    }
    if (dataValue.label) {
      cy.get("[data-testid='transfer-label-input']").clear().type(dataValue.label);
    }

    if (dataValue.transfer_mode === "Scheduled") {
      cy.get('[data-testid="transfer-mode-scheduled-radio"]').check();
      if (dataValue.transfer_date) {
        cy.get("[data-testid='transfer-date-input']").clear().type(convertDate(dataValue.transfer_date));
      }
    } else {
      cy.get('[data-testid="transfer-mode-instant-radio"]').check();
    }
  });
});

When("I select the {string} transfer mode", (transferMode) => {
  if (transferMode === "Scheduled") {
    cy.get('[data-testid="transfer-mode-scheduled-radio"]').check();
  } else {
    cy.get('[data-testid="transfer-mode-instant-radio"]').check();
  }
});

When("I validate the form", () => {
  cy.intercept("POST", "**/transfers").as("createTransfer");
  cy.get("[data-testid='transfer-submit-button']").should("be.visible").click();
});

Then("the transfer is confirmed", () => {
  cy.wait("@createTransfer").its("response.statusCode").should("be.oneOf", [200, 201]);
  cy.get("[data-testid='confirmation-message']").should("be.visible")
    .and("contain.text", SUCCESS_MESSAGE);
});

Then("an error message {string} is displayed", (result) => {
  cy.get("[data-testid='error-message']").should("be.visible")
    .and("contain.text", result);
});