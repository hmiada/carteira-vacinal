# Minha Carteira Vacinal — login Google configurado

**Esta distribuição pública não contém o histórico pessoal de vacinação.**

## Publicação no GitHub Pages

1. No repositório `hmiada/carteira-vacinal`, envie os arquivos desta pasta para a raiz, substituindo os existentes.
2. Confirme que `historico-inicial.js` NÃO está no repositório nem no histórico de commits.
3. Aguarde o deploy em Actions/Pages e abra `https://hmiada.github.io/carteira-vacinal/` em uma aba privada ou recarregue para atualizar o cache.
4. Clique em **Entrar com Google**. O Client ID público já está em `auth-config.js`. No Google Cloud, a origem JavaScript autorizada deve ser `https://hmiada.github.io` (sem caminho).
5. O aplicativo não inclui dados vacinais pré-carregados. Importe um **backup JSON privado** pela seção Backup, ou cadastre as vacinas manualmente. Nunca envie o backup ao GitHub.

## Segurança e limitações

- Google OAuth permite entrada pela interface, mas **não criptografa nem isola o IndexedDB**. Não use em dispositivos compartilhados.
- O login exige internet; registros permanecem no dispositivo. Não há sincronização.
- O arquivo JSON de backup não é criptografado; guarde-o em local privado.
- Após substituir arquivos no GitHub Pages, o Service Worker pode manter uma versão antiga por um curto período.
- O app não calcula recomendações oficiais de vacinação nesta versão.
