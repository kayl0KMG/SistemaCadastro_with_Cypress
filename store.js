// store.js
//
// Camada de dados da aplicação. Guarda clientes e produtos EM MEMÓRIA
// (arrays JavaScript). Os dados permanecem enquanto a página estiver
// aberta — trocar de aba não apaga nada —, mas um reload (F5) zera tudo.
//
// Usa o padrão UMD: funciona no navegador (window.Store) e no Node
// (module.exports), o que permite testar as regras isoladamente.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Store = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── Estado em memória ──────────────────────────────────────────
  let clientes = [];
  let produtos = [];
  let proximoIdCliente = 1;
  let proximoIdProduto = 1;

  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const CATEGORIAS = ['Alimentos', 'Bebidas', 'Eletrônicos', 'Limpeza', 'Papelaria'];

  const copiar = (obj) => Object.assign({}, obj);
  const texto = (v) => (v === undefined || v === null ? '' : String(v)).trim();

  // ── Clientes ───────────────────────────────────────────────────
  function validarCliente(dados, idIgnorado) {
    const nome = texto(dados.nome);
    const email = texto(dados.email).toLowerCase();
    const telefone = texto(dados.telefone);

    if (nome.length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres');
    }
    if (!REGEX_EMAIL.test(email)) {
      throw new Error('E-mail inválido');
    }
    if (clientes.some((c) => c.email === email && c.id !== idIgnorado)) {
      throw new Error('E-mail já cadastrado');
    }
    return { nome, email, telefone };
  }

  function criarCliente(dados) {
    const valido = validarCliente(dados, null);
    const cliente = Object.assign({ id: proximoIdCliente++ }, valido);
    clientes.push(cliente);
    return copiar(cliente);
  }

  function listarClientes(filtro) {
    const f = texto(filtro).toLowerCase();
    return clientes
      .filter((c) => !f || c.nome.toLowerCase().includes(f) || c.email.includes(f))
      .map(copiar);
  }

  function buscarCliente(id) {
    const c = clientes.find((x) => x.id === Number(id));
    return c ? copiar(c) : null;
  }

  function atualizarCliente(id, dados) {
    const indice = clientes.findIndex((c) => c.id === Number(id));
    if (indice === -1) throw new Error('Cliente não encontrado');
    const valido = validarCliente(dados, Number(id));
    clientes[indice] = Object.assign({ id: Number(id) }, valido);
    return copiar(clientes[indice]);
  }

  function excluirCliente(id) {
    const antes = clientes.length;
    clientes = clientes.filter((c) => c.id !== Number(id));
    if (clientes.length === antes) throw new Error('Cliente não encontrado');
  }

  // ── Produtos ───────────────────────────────────────────────────
  function validarProduto(dados) {
    const nome = texto(dados.nome);
    const precoTxt = texto(dados.preco);
    const estoqueTxt = texto(dados.estoque);
    const categoria = texto(dados.categoria);
    const preco = Number(precoTxt);
    const estoque = Number(estoqueTxt);

    if (nome.length < 2) {
      throw new Error('Nome do produto deve ter pelo menos 2 caracteres');
    }
    if (precoTxt === '' || isNaN(preco) || preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }
    if (estoqueTxt === '' || !Number.isInteger(estoque) || estoque < 0) {
      throw new Error('Estoque deve ser um número inteiro maior ou igual a zero');
    }
    if (!CATEGORIAS.includes(categoria)) {
      throw new Error('Selecione uma categoria');
    }
    return { nome, preco: Math.round(preco * 100) / 100, estoque, categoria };
  }

  function criarProduto(dados) {
    const valido = validarProduto(dados);
    const produto = Object.assign({ id: proximoIdProduto++ }, valido);
    produtos.push(produto);
    return copiar(produto);
  }

  function listarProdutos(filtro) {
    const f = texto(filtro).toLowerCase();
    return produtos
      .filter((p) => !f || p.nome.toLowerCase().includes(f) || p.categoria.toLowerCase().includes(f))
      .map(copiar);
  }

  function buscarProduto(id) {
    const p = produtos.find((x) => x.id === Number(id));
    return p ? copiar(p) : null;
  }

  function atualizarProduto(id, dados) {
    const indice = produtos.findIndex((p) => p.id === Number(id));
    if (indice === -1) throw new Error('Produto não encontrado');
    const valido = validarProduto(dados);
    produtos[indice] = Object.assign({ id: Number(id) }, valido);
    return copiar(produtos[indice]);
  }

  function excluirProduto(id) {
    const antes = produtos.length;
    produtos = produtos.filter((p) => p.id !== Number(id));
    if (produtos.length === antes) throw new Error('Produto não encontrado');
  }

  // ── Utilidades ─────────────────────────────────────────────────
  function formatarPreco(valor) {
    return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
  }

  function resetar() {
    clientes = [];
    produtos = [];
    proximoIdCliente = 1;
    proximoIdProduto = 1;
  }

  return {
    CATEGORIAS,
    criarCliente, listarClientes, buscarCliente, atualizarCliente, excluirCliente,
    totalClientes: () => clientes.length,
    criarProduto, listarProdutos, buscarProduto, atualizarProduto, excluirProduto,
    totalProdutos: () => produtos.length,
    formatarPreco,
    resetar,
  };
});
