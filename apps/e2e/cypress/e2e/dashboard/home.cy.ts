describe('Dashboard Home Page', () => {
	beforeEach(() => {
		cy.visit('/')
	})

	it('should load the home page', () => {
		cy.get('img[alt="Next.js logo"]').should('be.visible')
	})
})
