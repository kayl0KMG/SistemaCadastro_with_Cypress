// produtos.js
//
// Liga a tela de Produtos ao Store: cadastro, listagem, busca,
// edição e exclusão. Produtos com estoque 0 recebem o selo "Esgotado".

(function () {
  'use strict';

  const form = document.getElementById('formProduto');
  const campoId = document.getElementById('produtoId');
  const campoNome = document.getElementById('produtoNome');
  const campoPreco = document.getElementById('produtoPreco');
  const campoEstoque = document.getElementById('produtoEstoque');
  const campoCategoria = document.getElementById('produtoCategoria');
  const btnSalvar = document.getElementById('btnSalvarProduto');
  const btnCancelar = document.getElementById('btnCancelarProduto');
  const tituloForm = document.getElementById('tituloFormProduto');
  const mensagem = document.getElementById('msgProduto');
  const busca = document.getElementById('buscaProduto');
  const corpoTabela = document.querySelector('#tabelaProdutos tbody');
  const vazio = document.getElementById('vazioProdutos');
  const contador = document.getElementById('contadorProdutos');

  // Preenche o <select> de categorias a partir do Store
  Store.CATEGORIAS.forEach((cat) => {
    const opcao = document.createElement('option');
    opcao.value = cat;
    opcao.textContent = cat;
    campoCategoria.appendChild(opcao);
  });

  function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = 'mensagem ' + tipo;
  }

  function limparFormulario() {
    form.reset();
    campoId.value = '';
    btnSalvar.textContent = 'Cadastrar';
    tituloForm.textContent = 'Novo produto';
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
    const p = Store.buscarProduto(id);
    if (!p) return;
    campoId.value = p.id;
    campoNome.value = p.nome;
    campoPreco.value = p.preco;
    campoEstoque.value = p.estoque;
    campoCategoria.value = p.categoria;
    btnSalvar.textContent = 'Atualizar';
    tituloForm.textContent = 'Editar produto';
    btnCancelar.hidden = false;
    mensagem.className = 'mensagem';
    mensagem.textContent = '';
    campoNome.focus();
  }

  function excluir(id) {
    const p = Store.buscarProduto(id);
    if (!p) return;
    if (!window.confirm('Deseja excluir o produto "' + p.nome + '"?')) return;
    Store.excluirProduto(id);
    if (campoId.value === String(id)) limparFormulario();
    mostrarMensagem('Produto excluído com sucesso!', 'sucesso');
    render();
  }

  function render() {
    const lista = Store.listarProdutos(busca.value);
    corpoTabela.innerHTML = '';

    lista.forEach((p) => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-cy', 'linha-produto');
      tr.dataset.id = p.id;
      tr.appendChild(celula(p.nome));
      tr.appendChild(celula(p.categoria));
      tr.appendChild(celula(Store.formatarPreco(p.preco)));

      const tdEstoque = celula(String(p.estoque));
      if (p.estoque === 0) {
        const selo = document.createElement('span');
        selo.className = 'selo-esgotado';
        selo.setAttribute('data-cy', 'selo-esgotado');
        selo.textContent = 'Esgotado';
        tdEstoque.appendChild(selo);
      }
      tr.appendChild(tdEstoque);

      const acoes = document.createElement('td');
      acoes.className = 'acoes';
      acoes.appendChild(botao('Editar', 'btn-editar', 'btn-secundario', () => editar(p.id)));
      acoes.appendChild(botao('Excluir', 'btn-excluir', 'btn-perigo', () => excluir(p.id)));
      tr.appendChild(acoes);

      corpoTabela.appendChild(tr);
    });

    vazio.hidden = lista.length > 0;
    vazio.textContent = Store.totalProdutos() === 0
      ? 'Nenhum produto cadastrado'
      : 'Nenhum produto encontrado';
    contador.textContent = Store.totalProdutos();
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = {
      nome: campoNome.value,
      preco: campoPreco.value,
      estoque: campoEstoque.value,
      categoria: campoCategoria.value,
    };
    try {
      if (campoId.value) {
        Store.atualizarProduto(campoId.value, dados);
        mostrarMensagem('Produto atualizado com sucesso!', 'sucesso');
      } else {
        Store.criarProduto(dados);
        mostrarMensagem('Produto cadastrado com sucesso!', 'sucesso');
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
