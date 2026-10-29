// cypress/e2e/clientes.cy.js
// Testes E2E do CRUD de Clientes.
// Cada teste começa com cy.visit('/'): a página é recarregada
// e, como os dados ficam em memória, a lista começa VAZIA.

describe('CRUD de Clientes (E2E)', () => {
    beforeEach(() => {
        cy.visit('/')
    })
    // Helper: preenche o formulário e clica em Cadastrar/Atualizar
    function preencherCliente(nome, email, telefone) {
        cy.get('#clienteNome').clear().type(nome)
        cy.get('#clienteEmail').clear().type(email)
        if (telefone) {
            cy.get('#clienteTelefone').clear().type(telefone)
        }
        cy.get('#btnSalvarCliente').click()
    }
    // ── Estado inicial ──────────────────────────────────────────────
    describe('Estado inicial', () => {
        it('exibe a aba Clientes ativa e a de Produtos oculta', () => {
            cy.get('#abaClientes').should('have.class', 'ativa')
            cy.get('#secClientes').should('be.visible')
            cy.get('#secProdutos').should('not.be.visible')
        })
        it('exibe a lista vazia e o contador zerado', () => {
            cy.get('[data-cy=linha-cliente]').should('not.exist')
            cy.get('#vazioClientes').should('be.visible')
                .and('have.text', 'Nenhum cliente cadastrado')
            cy.get('#contadorClientes').should('have.text', '0')
        })
    })
    // ── CREATE ──────────────────────────────────────────────────────
    describe('Cadastrar (Create)', () => {
        it('cadastra um cliente e o exibe na tabela', () => {
            preencherCliente('Ana Souza', 'ana@email.com', '(88) 99999-0001')
            cy.get('#msgCliente').should('have.class', 'sucesso')
                .and('have.text', 'Cliente cadastrado com sucesso!')
            cy.get('[data-cy=linha-cliente]').should('have.length', 1)
                .first()
                .should('contain.text', 'Ana Souza')
                .and('contain.text', 'ana@email.com')
                .and('contain.text', '(88) 99999-0001')
            cy.get('#contadorClientes').should('have.text', '1')
            cy.get('#vazioClientes').should('not.be.visible')
        })
        it('limpa o formulário após cadastrar', () => {
            preencherCliente('Ana Souza', 'ana@email.com')
            cy.get('#clienteNome').should('have.value', '')
            cy.get('#clienteEmail').should('have.value', '')
        })
        it('cadastra vários clientes e mantém todos na lista', () => {
            preencherCliente('Ana Souza', 'ana@email.com')
            preencherCliente('Bruno Lima', 'bruno@email.com')
            preencherCliente('Carla Dias', 'carla@email.com')
            cy.get('[data-cy=linha-cliente]').should('have.length', 3)
            cy.get('#contadorClientes').should('have.text', '3')
        })
        it('exibe "—" quando o telefone não é informado', () => {
            preencherCliente('Ana Souza', 'ana@email.com')
            cy.get('[data-cy=linha-cliente]').first().find('td').eq(2)
                .should('have.text', '—')
        })
    })
    // ── Validações ──────────────────────────────────────────────────
    describe('Validações do formulário', () => {
        it('rejeita nome com menos de 3 caracteres', () => {
            preencherCliente('Al', 'al@email.com')
            cy.get('#msgCliente').should('have.class', 'erro')
                .and('contain.text', 'pelo menos 3 caracteres')
            cy.get('[data-cy=linha-cliente]').should('not.exist')
        })
        it('rejeita e-mail inválido', () => {
            preencherCliente('Ana Souza', 'ana-sem-arroba')
            cy.get('#msgCliente').should('have.text', 'E-mail inválido')
            cy.get('#contadorClientes').should('have.text', '0')
        })
        it('rejeita e-mail duplicado', () => {
            preencherCliente('Ana Souza', 'ana@email.com')
            preencherCliente('Ana Clara', 'ana@email.com')
            cy.get('#msgCliente').should('have.text', 'E-mail já cadastrado')
            cy.get('[data-cy=linha-cliente]').should('have.length', 1)
        })
        it('rejeita formulário totalmente vazio', () => {
            cy.get('#btnSalvarCliente').click()
            cy.get('#msgCliente').should('have.class', 'erro')
            cy.get('[data-cy=linha-cliente]').should('not.exist')
        })

        // ── READ (busca) ────────────────────────────────────────────────
        describe('Buscar (Read)', () => {
            beforeEach(() => {
                preencherCliente('Ana Souza', 'ana@email.com')
                preencherCliente('Bruno Lima', 'bruno@email.com')
                preencherCliente('Carla Dias', 'carla@email.com')
            })
            it('filtra a lista pelo nome', () => {
                cy.get('#buscaCliente').type('bruno')
                cy.get('[data-cy=linha-cliente]').should('have.length', 1)
                    .and('contain.text', 'Bruno Lima')
            })
            it('filtra a lista pelo e-mail', () => {
                cy.get('#buscaCliente').type('carla@')
                cy.get('[data-cy=linha-cliente]').should('have.length', 1)
                    .and('contain.text', 'Carla Dias')
            })

            it('mostra mensagem quando nada é encontrado', () => {
            })
            cy.get('#buscaCliente').type('zzz')
            cy.get('[data-cy=linha-cliente]').should('not.exist')
            cy.get('#vazioClientes').should('have.text', 'Nenhum cliente encontrado')
            // O contador mostra o total geral, não o filtrado
            cy.get('#contadorClientes').should('have.text', '3')
        })
        it('volta a exibir todos ao limpar a busca', () => {
            cy.get('#buscaCliente').type('ana')
            cy.get('[data-cy=linha-cliente]').should('have.length', 1)
            cy.get('#buscaCliente').clear()
            cy.get('[data-cy=linha-cliente]').should('have.length', 3)
        })
    })
    // ── UPDATE ──────────────────────────────────────────────────────
    describe('Editar (Update)', () => {
        beforeEach(() => {
            preencherCliente('Ana Souza', 'ana@email.com', '(88) 99999-0001')
        })
        it('carrega os dados do cliente no formulário ao clicar em Editar', () => {
            cy.contains('[data-cy=linha-cliente]', 'Ana Souza')
                .find('[data-cy=btn-editar]').click()
            cy.get('#tituloFormCliente').should('have.text', 'Editar cliente')
            cy.get('#btnSalvarCliente').should('have.text', 'Atualizar')
            cy.get('#btnCancelarCliente').should('be.visible')
            cy.get('#clienteNome').should('have.value', 'Ana Souza')
            cy.get('#clienteEmail').should('have.value', 'ana@email.com')
        })
        it('atualiza o cliente e reflete a mudança na tabela', () => {
            cy.contains('[data-cy=linha-cliente]', 'Ana Souza')
                .find('[data-cy=btn-editar]').click()
            preencherCliente('Ana Souza Ribeiro', 'ana.ribeiro@email.com')
            cy.get('#msgCliente').should('have.text', 'Cliente atualizado com sucesso!')
            cy.get('[data-cy=linha-cliente]').should('have.length', 1)
                .and('contain.text', 'Ana Souza Ribeiro')
                .and('contain.text', 'ana.ribeiro@email.com')
            cy.get('#btnSalvarCliente').should('have.text', 'Cadastrar')
        })
        it('cancela a edição sem alterar os dados', () => {
            cy.contains('[data-cy=linha-cliente]', 'Ana Souza')
                .find('[data-cy=btn-editar]').click()
            cy.get('#clienteNome').clear().type('Nome Que Não Vai Salvar')
            cy.get('#btnCancelarCliente').click()
            cy.get('#clienteNome').should('have.value', '')
            cy.get('#btnCancelarCliente').should('not.be.visible')
            cy.get('[data-cy=linha-cliente]').should('contain.text', 'Ana Souza')
                .and('not.contain.text', 'Nome Que Não Vai Salvar')
        })
        it('permite manter o próprio e-mail ao editar', () => {
            cy.contains('[data-cy=linha-cliente]', 'Ana Souza')
                .find('[data-cy=btn-editar]').click()
            cy.get('#clienteNome').clear().type('Ana S.')
            cy.get('#btnSalvarCliente').click()
            cy.get('#msgCliente').should('have.class', 'sucesso')
            cy.get('[data-cy=linha-cliente]').should('contain.text', 'Ana S.')
        })
    })
    // ── DELETE ──────────────────────────────────────────────────────
    describe('Excluir (Delete)', () => {
        beforeEach(() => {
            preencherCliente('Ana Souza', 'ana@email.com')
            preencherCliente('Bruno Lima', 'bruno@email.com')
        })
        it('exclui o cliente quando o usuário confirma', () => {
            // Intercepta o window.confirm() e responde "OK"
            cy.on('window:confirm', (mensagem) => {
                expect(mensagem).to.contain('Bruno Lima')
                return true
            })
            cy.contains('[data-cy=linha-cliente]', 'Bruno Lima')
                .find('[data-cy=btn-excluir]').click()
            cy.get('#msgCliente').should('have.text', 'Cliente excluído com sucesso!')
            cy.get('[data-cy=linha-cliente]').should('have.length', 1)
                .and('not.contain.text', 'Bruno Lima')
                cy.get('#contadorClientes').should('have.text', '1')
        })
        it('mantém o cliente quando o usuário cancela a confirmação', () => {
            // Responde "Cancelar" no window.confirm()
            cy.on('window:confirm', () => false)
            cy.contains('[data-cy=linha-cliente]', 'Bruno Lima')
                .find('[data-cy=btn-excluir]').click()
            cy.get('[data-cy=linha-cliente]').should('have.length', 2)
            cy.get('#contadorClientes').should('have.text', '2')
        })
        it('volta a exibir a mensagem de lista vazia ao excluir todos', () => {
            cy.on('window:confirm', () => true)
            cy.get('[data-cy=btn-excluir]').first().click()
            cy.get('[data-cy=btn-excluir]').first().click()
            cy.get('[data-cy=linha-cliente]').should('not.exist')
            cy.get('#vazioClientes').should('have.text', 'Nenhum cliente cadastrado')
        })
    })
})