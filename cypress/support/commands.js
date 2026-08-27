Cypress.Commands.add("loginAs", (role) => {
    cy.fixture('users').then((users) => {
        const user = users[role];
        cy.session(role, () => {
            cy.visit('/login');
            cy.get('input[name="email"]').type(user.email);
            cy.get('input[name="password"]').type(user.password);
            cy.get('button[type="submit"]').click();
            cy.url().should("include", "/home");
        });
    });
});
