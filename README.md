# Minha Carteira Vacinal — Etapa 2 + Login Google

PWA offline e gratuito para cadastro pessoal de vacinas. Sem servidor próprio e sem telemetria. Login Google pela biblioteca oficial Google Identity Services; dados locais sem sincronização. **Esta versão permite importar 39 aplicações confirmadas e 1 registro em revisão**, sem substituir registros existentes. A importação é iniciada manualmente no Histórico.

## Rodar localmente

No diretório do projeto, execute `python3 -m http.server 8000` e abra `http://localhost:8000` no computador. Service Workers funcionam em localhost ou HTTPS. Para usar no iPhone, publique os arquivos em hospedagem HTTPS estática (ex.: GitHub Pages).

## Publicar no GitHub Pages

Crie um repositório público contendo apenas estes arquivos de código (não inclua backups JSON), faça upload, vá a **Settings > Pages**, selecione deploy pela branch principal e abra a URL HTTPS gerada no Safari. Use **Compartilhar > Adicionar à Tela de Início**. O código público não contém seus dados pessoais; eles permanecem no IndexedDB do aparelho.

## Recursos implementados

- Cadastro, edição, exclusão, pesquisa e resumo de aplicações.
- Datas exatas, prováveis, apenas ano ou desconhecidas.
- Registros confirmados e em revisão.
- Banco IndexedDB local.
- Backup JSON e restauração com validação e confirmação de substituição.
- Exportação CSV e impressão para PDF pelo navegador.
- Manifesto PWA, ícones e cache offline com service worker.

## Limitações importantes

- Não há cálculo de próximas doses nem motor PNI nesta etapa.
- A importação inicial é manual e idempotente (por ID); não importa anexos nem fornece lembretes.
- O registro de sarampo não confirmado fica em revisão; histórico desconhecido (Twinrix, dengue e meningocócicas) é mostrado à parte, sem contar doses.
- Alguns lotes e a data da Sabin de 1986 são prováveis, não definitivos.
- Se você já tiver cadastrado manualmente as mesmas vacinas com IDs diferentes, revise possíveis duplicidades antes de importar.
- Não há sincronização entre aparelhos.
- JSON/CSV não são criptografados: guarde-os em local privado.
- Dados locais podem ser removidos pelo navegador/sistema; faça backups regulares.
- A restauração substitui todo o histórico atual.
- Para PDF no iPhone, use a opção de impressão do Safari e salve o documento em Arquivos.

## Etapa 2 + Login Google: importação

Abra **Histórico > Importar histórico conferido** e confirme. O botão adiciona somente os IDs que ainda não existem. A aplicação mantém a contagem de 39 confirmadas e 1 em revisão quando não há outros registros. Para segurança, faça backup JSON antes de importar.


## Login Google (etapa adicional)

1. No Google Cloud Console, crie ou selecione um projeto e configure a **tela de consentimento OAuth**. Para teste, adicione sua conta como usuário de teste quando necessário.
2. Crie uma credencial **OAuth Client ID > Web application**. Cadastre em **Authorized JavaScript origins** a origem HTTPS exata do PWA (ex.: `https://usuario.github.io`, sem o caminho do repositório). Para teste local, inclua `http://localhost:8000`.
3. Copie o Client ID público para `auth-config.js`, substituindo `COLE_SEU_CLIENT_ID_AQUI.apps.googleusercontent.com`. **Não coloque client secret no projeto**.
4. Publique os arquivos atualizados no GitHub Pages, abra no Safari e toque em **Entrar com Google**. Login requer internet.
5. **Sair** encerra a sessão visual e solicita revogação do token OAuth, mas **não apaga os dados**.

### Limites de segurança e privacidade

- O login é uma **barreira de interface**, não um mecanismo de criptografia ou isolamento seguro do IndexedDB. Quem controla o navegador/dispositivo ou executa código na origem do app pode acessar os dados.
- Todos os logins que usam a mesma instalação/origem do PWA verão o **mesmo banco local**. Portanto, não use esta versão em aparelho compartilhado ou para várias contas Google.
- Os dados **não são sincronizados** nem enviados ao Google. Apenas o login usa o Google; o navegador consulta o endpoint de perfil para validar o acesso.
- Ao recarregar, será necessário entrar novamente; offline, novos logins não funcionam. Depois de entrar, o cadastro local pode funcionar sem rede.
- Faça backups JSON privados antes de atualizar ou reinstalar o PWA. Backup JSON não é criptografado.
- O Client ID pode ser público; nunca publique client secret, token de acesso ou arquivo de backup.
