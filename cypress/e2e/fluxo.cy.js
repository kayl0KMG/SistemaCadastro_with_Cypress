// cypress/e2e/fluxo.cy.js
// Testes de FLUXO: verificam o estado em memória atravessando
// as duas telas, como um usuário real faria numa sessão de uso.

describe('Fluxo integrado e estado em memória (E2E)', () => {
    beforeEach(() => {
        cy.visit('/')
    })
    it('mantém os dados ao alternar entre as abas', () => {
        // Cadastra um cliente
        cy.get('#clienteNome').type('Ana Souza')
        cy.get('#clienteEmail').type('ana@email.com')
        cy.get('#btnSalvarCliente').click()

        // Vai para Produtos e cadastra um produto
        cy.get('#abaProdutos').click()
        cy.get('#produtoNome').type('Café 500g')
        cy.get('#produtoPreco').type('18.90')
        cy.get('#produtoEstoque').type('30')
        cy.get('#produtoCategoria').select('Alimentos')
        cy.get('#btnSalvarProduto').click()

        // Volta para Clientes: o cliente continua lá
        cy.get('#abaClientes').click()
        cy.get('[data-cy=linha-cliente]').should('have.length', 1)
            .and('contain.text', 'Ana Souza')

        // Volta para Produtos: o produto continua lá
        cy.get('#abaProdutos').click()
        cy.get('[data-cy=linha-produto]').should('have.length', 1)
            .and('contain.text', 'Café 500g')
    })
    it('atualiza os contadores das abas independentemente', () => {
        cy.get('#clienteNome').type('Ana Souza')
        cy.get('#clienteEmail').type('ana@email.com') 
        cy.get('#btnSalvarCliente').click()
        cy.get('#contadorClientes').should('have.text', '1')
        cy.get('#contadorProdutos').should('have.text', '0')
    })
    it('perde todos os dados ao recarregar a página (memória volátil)', () => {
        cy.get('#clienteNome').type('Ana Souza')
        cy.get('#clienteEmail').type('ana@email.com')
        cy.get('#btnSalvarCliente').click()
        cy.get('#contadorClientes').should('have.text', '1')
        cy.reload()
        cy.get('#contadorClientes').should('have.text', '0')
        cy.get('[data-cy=linha-cliente]').should('not.exist')
    })
    it('executa um ciclo CRUD completo em clientes', () => {
        cy.on('window:confirm', () => true)

        // Create
        cy.get('#clienteNome').type('Bruno Lima')
        cy.get('#clienteEmail').type('bruno@email.com')
        cy.get('#btnSalvarCliente').click()
        cy.get('[data-cy=linha-cliente]').should('contain.text', 'Bruno Lima')

        // Update
        cy.contains('[data-cy=linha-cliente]', 'Bruno Lima')
            .find('[data-cy=btn-editar]').click()
        cy.get('#clienteNome').clear().type('Bruno Lima Neto')
        cy.get('#btnSalvarCliente').click()
        cy.get('[data-cy=linha-cliente]').should('contain.text', 'Bruno Lima Neto')
       
        // Delete
        cy.contains('[data-cy=linha-cliente]', 'Bruno Lima Neto')
                    .find('[data-cy=btn-excluir]').click()
        cy.get('[data-cy=linha-cliente]').should('not.exist')
        cy.get('#contadorClientes').should('have.text', '0')
  })
})

