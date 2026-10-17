# Minha Carteira Vacinal — Etapa 3 (base PNI + SBIm)

## Publicação segura
Envie **somente os arquivos desta pasta pública** para a raiz do repositório GitHub Pages. 
**NÃO publique** o arquivo `HISTORICO-PRIVADO-importacao-39-vacinas.json`, fotos, comprovantes ou backups.

## Importação privada
1. Salve `HISTORICO-PRIVADO-importacao-39-vacinas.json` no app Arquivos do iPhone.
2. Atualize os arquivos públicos no GitHub e aguarde a publicação.
3. Abra o PWA e vá a Histórico → Importar histórico privado (JSON).
4. Selecione o arquivo local e confirme a importação.
5. Confira 39 aplicações confirmadas + 1 registro em revisão. A importação não exclui registros existentes e ignora IDs ou vacina/data iguais.
6. Faça um backup JSON novo e mantenha-o fora do GitHub.

## Motor de regras
`rules.js` contém a primeira versão conservadora, separando PNI 2026 e SBIm 2026/2027.
As regras NÃO são atualizadas automaticamente e NÃO substituem avaliação médica.
Algumas regras são apenas alertas de verificação, não cálculo completo de elegibilidade.
PNI: https://www.gov.br/saude/pt-br/vacinacao/calendario
SBIm: https://sbim.org.br/calendario-de-vacinacao/adultos-21-a-59-anos

## Privacidade e limitações
- Login Google não criptografa IndexedDB nem isola usuários no mesmo navegador.
- Não há sincronização em nuvem.
- O backup JSON não é criptografado.
- O registro fictício de teste deve ser removido antes da importação definitiva.
- A contagem de 39 é esperada apenas se não houver outros registros confirmados locais.
