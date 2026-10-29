// app.js
// Controla a navegação entre as abas Clientes e Produtos.
// Trocar de aba só esconde/mostra seções: os dados no Store continuam em memória.

(function () {
  'use strict';

  const abas = document.querySelectorAll('[data-aba]');

  function ativarAba(nome) {
    abas.forEach((botao) => {
      const ativa = botao.dataset.aba === nome;
      botao.classList.toggle('ativa', ativa);
      botao.setAttribute('aria-selected', String(ativa));
      document.getElementById(botao.getAttribute('aria-controls')).hidden = !ativa;
    });
  }

  abas.forEach((botao) => {
    botao.addEventListener('click', () => ativarAba(botao.dataset.aba));
  });

  ativarAba('clientes');
})();
