// cypress/e2e/produtos.cy.js
//
// Testes E2E do CRUD de Produtos.
// Antes de cada teste: abre a página e troca para a aba Produtos.

describe('CRUD de Produtos (E2E)', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.get('#abaProdutos').click()
    })
    // Helper: preenche o formulário de produto e salva
    function preencherProduto(nome, preco, estoque, categoria) {
        cy.get('#produtoNome').clear().type(nome)
        cy.get('#produtoPreco').clear().type(String(preco))
        cy.get('#produtoEstoque').clear().type(String(estoque))
        cy.get('#produtoCategoria').select(categoria)
        cy.get('#btnSalvarProduto').click()
    }
    // ── Estado inicial ──────────────────────────────────────────────
    describe('Estado inicial', () => {
        it('exibe a aba Produtos ativa', () => {
            cy.get('#abaProdutos').should('have.class', 'ativa')
            cy.get('#secProdutos').should('be.visible')
            cy.get('#secClientes').should('not.be.visible')
        })
        it('carrega as categorias no select', () => {
            cy.get('#produtoCategoria option').should('have.length', 6) // 
            "Selecione..." + 5
            cy.get('#produtoCategoria').should('contain.text', 'Bebidas')
        })
        it('exibe a lista vazia', () => {
            cy.get('[data-cy=linha-produto]').should('not.exist')
            cy.get('#vazioProdutos').should('have.text', 'Nenhum produto cadastrado')
            cy.get('#contadorProdutos').should('have.text', '0')
        })
    })
    // ── CREATE ──────────────────────────────────────────────────────
    describe('Cadastrar (Create)', () => {
        it('cadastra um produto com preço formatado em reais', () => {
            preencherProduto('Café 500g', 18.9, 30, 'Alimentos')
            cy.get('#msgProduto').should('have.text', 'Produto cadastrado com sucesso!')
            cy.get('[data-cy=linha-produto]').should('have.length', 1)
                .first().should('contain.text', 'Café 500g')
                .and('contain.text', 'Alimentos')
                .and('contain.text', 'R$ 18,90')
            cy.get('#contadorProdutos').should('have.text', '1')
        })
        it('exibe o selo "Esgotado" para estoque zero', () => {
            preencherProduto('Refrigerante 2L', 9.5, 0, 'Bebidas')
            cy.contains('[data-cy=linha-produto]', 'Refrigerante 2L')
                .find('[data-cy=selo-esgotado]')
                .should('be.visible')
                .and('have.text', 'Esgotado')
        })
        it('não exibe o selo para produto com estoque', () => {
            preencherProduto('Caderno', 12, 5, 'Papelaria')
            cy.get('[data-cy=selo-esgotado]').should('not.exist')
        })
    })
    // ── Validações ──────────────────────────────────────────────────
    describe('Validações do formulário', () => {
        it('rejeita preço zero', () => {
            preencherProduto('Caneta', 0, 10, 'Papelaria')
            cy.get('#msgProduto').should('have.class', 'erro')
                .and('have.text', 'Preço deve ser maior que zero')
            cy.get('[data-cy=linha-produto]').should('not.exist')
        })
        it('rejeita estoque negativo', () => {
            preencherProduto('Caneta', 2.5, -3, 'Papelaria')
            cy.get('#msgProduto').should('contain.text', 'Estoque deve ser')
        })
        it('rejeita estoque fracionado', () => {
            preencherProduto('Caneta', 2.5, 1.5, 'Papelaria')
            cy.get('#msgProduto').should('contain.text', 'inteiro')
        })
        it('exige a seleção de uma categoria', () => {
            cy.get('#produtoNome').type('Detergente')
            cy.get('#produtoPreco').type('3.2')
            cy.get('#produtoEstoque').type('20')
            cy.get('#btnSalvarProduto').click()
            cy.get('#msgProduto').should('have.text', 'Selecione uma categoria')
        })
    })
})

// ── READ (busca) ────────────────────────────────────────────────
describe('Buscar (Read)', () => {
    beforeEach(() => {
        preencherProduto('Café 500g', 18.9, 30, 'Alimentos')
        preencherProduto('Suco de Uva', 7.5, 12, 'Bebidas')
        preencherProduto('Fone Bluetooth', 129.9, 4, 'Eletrônicos')
    })
    it('filtra pelo nome do produto', () => {
        cy.get('#buscaProduto').type('fone')
        cy.get('[data-cy=linha-produto]').should('have.length', 1)
            .and('contain.text', 'Fone Bluetooth')
    })
    it('filtra pela categoria', () => {
        cy.get('#buscaProduto').type('bebidas')
        cy.get('[data-cy=linha-produto]').should('have.length', 1)
            .and('contain.text', 'Suco de Uva')
    })
})
// ── UPDATE ──────────────────────────────────────────────────────
describe('Editar (Update)', () => {
    beforeEach(() => {
        preencherProduto('Café 500g', 18.9, 30, 'Alimentos')
    })
    it('carrega os dados do produto no formulário', () => {
        cy.contains('[data-cy=linha-produto]', 'Café 500g')
            .find('[data-cy=btn-editar]').click()
        cy.get('#produtoNome').should('have.value', 'Café 500g')
        cy.get('#produtoPreco').should('have.value', '18.9')
        cy.get('#produtoEstoque').should('have.value', '30')
        cy.get('#produtoCategoria').should('have.value', 'Alimentos')
        cy.get('#btnSalvarProduto').should('have.text', 'Atualizar')
    })
    it('atualiza preço e estoque', () => {
        cy.contains('[data-cy=linha-produto]', 'Café 500g').find('[data-cy=btn-editar]').click()
        cy.get('#produtoPreco').clear().type('21.5')
        cy.get('#produtoEstoque').clear().type('0')
        cy.get('#btnSalvarProduto').click()
        cy.get('#msgProduto').should('have.text', 'Produto atualizado com sucesso!')
      cy.get('[data-cy=linha-produto]').should('have.length', 1)
                .and('contain.text', 'R$ 21,50')
                .find('[data-cy=selo-esgotado]').should('exist')
    })
})
// ── DELETE ──────────────────────────────────────────────────────
describe('Excluir (Delete)', () => {
    beforeEach(() => {
        preencherProduto('Café 500g', 18.9, 30, 'Alimentos')
        preencherProduto('Suco de Uva', 7.5, 12, 'Bebidas')
    })
    it('exclui o produto após confirmação', () => {
        cy.on('window:confirm', (mensagem) => {
            expect(mensagem).to.equal('Deseja excluir o produto "Suco de Uva"?')
            return true
        })
        cy.contains('[data-cy=linha-produto]', 'Suco de Uva')
            .find('[data-cy=btn-excluir]').click()
        cy.get('#msgProduto').should('have.text', 'Produto excluído com sucesso!')
      cy.get('[data-cy=linha-produto]').should('have.length', 1)
      cy.get('#contadorProdutos').should('have.text', '1')
    })
    it('não exclui quando a confirmação é cancelada', () => {
        cy.on('window:confirm', () => false)
        cy.contains('[data-cy=linha-produto]', 'Suco de Uva')
            .find('[data-cy=btn-excluir]').click()
        cy.get('[data-cy=linha-produto]').should('have.length', 2)
    })
})
