// clientes.js
// Liga a tela de Clientes ao Store: cadastro, listagem, busca,
// edição e exclusão. Toda alteração chama render() para redesenhar a tabela.

(function () {
  'use strict';

  const form = document.getElementById('formCliente');
  const campoId = document.getElementById('clienteId');
  const campoNome = document.getElementById('clienteNome');
  const campoEmail = document.getElementById('clienteEmail');
  const campoTelefone = document.getElementById('clienteTelefone');
  const btnSalvar = document.getElementById('btnSalvarCliente');
  const btnCancelar = document.getElementById('btnCancelarCliente');
  const tituloForm = document.getElementById('tituloFormCliente');
  const mensagem = document.getElementById('msgCliente');
  const busca = document.getElementById('buscaCliente');
  const corpoTabela = document.querySelector('#tabelaClientes tbody');
  const vazio = document.getElementById('vazioClientes');
  const contador = document.getElementById('contadorClientes');

  function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = 'mensagem ' + tipo;
  }

  function limparFormulario() {
    form.reset();
    campoId.value = '';
    btnSalvar.textContent = 'Cadastrar';
    tituloForm.textContent = 'Novo cliente';
    btnCancelar.hidden = true;
  }

  function celula(texto) {
    const td = document.createElement('td');
    td.textContent = texto;
    return td;
  }

  function botao(texto, dataCy, classe, aoClicar) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = texto;
    b.className = 'btn ' + classe;
    b.setAttribute('data-cy', dataCy);
    b.addEventListener('click', aoClicar);
    return b;
  }

  function editar(id) {
    const c = Store.buscarCliente(id);
    if (!c) return;
    campoId.value = c.id;
    campoNome.value = c.nome;
    campoEmail.value = c.email;
    campoTelefone.value = c.telefone;
    btnSalvar.textContent = 'Atualizar';
    tituloForm.textContent = 'Editar cliente';
    btnCancelar.hidden = false;
    mensagem.className = 'mensagem';
    mensagem.textContent = '';
    campoNome.focus();
  }

  function excluir(id) {
    const c = Store.buscarCliente(id);
    if (!c) return;
    if (!window.confirm('Deseja excluir o cliente "' + c.nome + '"?')) return;
    Store.excluirCliente(id);
    if (campoId.value === String(id)) limparFormulario();
    mostrarMensagem('Cliente excluído com sucesso!', 'sucesso');
    render();
  }

  function render() {
    const lista = Store.listarClientes(busca.value);
    corpoTabela.innerHTML = '';

    lista.forEach((c) => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-cy', 'linha-cliente');
      tr.dataset.id = c.id;
      tr.appendChild(celula(c.nome));
      tr.appendChild(celula(c.email));
      tr.appendChild(celula(c.telefone || '—'));

      const acoes = document.createElement('td');
      acoes.className = 'acoes';
      acoes.appendChild(botao('Editar', 'btn-editar', 'btn-secundario', () => editar(c.id)));
      acoes.appendChild(botao('Excluir', 'btn-excluir', 'btn-perigo', () => excluir(c.id)));
      tr.appendChild(acoes);

      corpoTabela.appendChild(tr);
    });

    vazio.hidden = lista.length > 0;
    vazio.textContent = Store.totalClientes() === 0
      ? 'Nenhum cliente cadastrado'
      : 'Nenhum cliente encontrado';
    contador.textContent = Store.totalClientes();
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = {
      nome: campoNome.value,
      email: campoEmail.value,
      telefone: campoTelefone.value,
    };
    try {
      if (campoId.value) {
        Store.atualizarCliente(campoId.value, dados);
        mostrarMensagem('Cliente atualizado com sucesso!', 'sucesso');
      } else {
        Store.criarCliente(dados);
        mostrarMensagem('Cliente cadastrado com sucesso!', 'sucesso');
      }
      limparFormulario();
      render();
    } catch (erro) {
      mostrarMensagem(erro.message, 'erro');
    }
  });

  btnCancelar.addEventListener('click', () => {
    limparFormulario();
    mensagem.className = 'mensagem';
    mensagem.textContent = '';
  });

  busca.addEventListener('input', render);

  render();
})();
