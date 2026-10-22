# Gangue do Patinete — Frontend

**Acervo** é um portal em que o aluno encontra, numa única página por disciplina, tudo o que hoje está espalhado entre grupos de WhatsApp, PDFs soltos e conversas de corredor: ementa, carga horária, pré-requisitos, professores, materiais enviados pela comunidade (resumos, provas antigas, listas, links), avaliações de dificuldade e carga de trabalho feitas por quem já cursou e uma área de perguntas e respostas com veteranos.

Este repositório contém a interface web do projeto. A API fica no repositório [escolhaDisciplinas_api](https://github.com/sasassa123/escolhaDisciplinas_api).

## Stack
React 19, Vite, React Router DOM, Axios, CSS puro (mobile-first). Fontes do Google Fonts (Fraunces, Instrument Sans e JetBrains Mono).

## Pré-requisitos
- Node.js 20.19 ou superior (exigência do Vite 8)
- A API rodando em http://localhost:3001 (veja o README do backend)

## Como rodar
```bash
npm install
cp .env.example .env
npm run dev       # desenvolvimento (hot reload)
```
O frontend roda em http://localhost:5173

Outros comandos:
```bash
npm run build     # gera a versão de produção na pasta dist/
npm run preview   # serve a versão de produção localmente
npm run lint      # verifica o código com ESLint
```

Em desenvolvimento, a tela de login mostra atalhos para as contas de demonstração criadas pelo seed da API (calouro, veterano e moderadora).

## Variáveis de ambiente
| Variável | Descrição | Exemplo |
|---|---|---|
| VITE_API_URL | URL base da API | http://localhost:3001/api |

## Funcionalidades (requisitos do documento de escopo)
| Requisito | Onde está |
|---|---|
| RF01 Cadastro com e-mail institucional e confirmação por link | `/cadastro`, `/confirmar-email` |
| RF02 Busca e listagem por nome, código, período, obrigatória/optativa | `/disciplinas`, `/busca` |
| RF03 Página da disciplina (ementa, carga, pré-requisitos, professores, bibliografia) | `/disciplinas/:codigo` |
| RF04/RF05 Upload e download de materiais com contador | aba **Materiais** |
| RF06 Avaliação de dificuldade, carga e comentário | aba **Avaliações** |
| RF07 Perguntas e respostas públicas e pesquisáveis | aba **Perguntas**, `/perguntas/:id`, `/busca` |
| RF08 Votos em materiais e respostas, melhor resposta | materiais e respostas |
| RF09 Denúncias e painel de moderação | botão **Denunciar**, `/moderacao` |
| RF10 Perfil com curso, período, contribuições e selos de veterano | `/perfil`, `/usuarios/:id` |
| US01 Comparar optativas | `/comparar` (até 4 disciplinas, com alerta de combinação pesada) |

## Rotas
| Rota | Página |
|---|---|
| / | Início: busca, mapa da grade colorido por dificuldade, perguntas sem resposta e materiais recentes |
| /disciplinas | Catálogo com busca, filtros e ordenação (filtros ficam na URL) |
| /disciplinas/:codigo | Página da disciplina com abas (`?aba=materiais`, `avaliacoes`, `perguntas`) |
| /perguntas/:id | Pergunta com respostas (melhor resposta no topo) |
| /comparar | Comparação lado a lado |
| /busca?q= | Busca em disciplinas, perguntas e respostas |
| /entrar, /cadastro, /confirmar-email | Autenticação |
| /perfil | Perfil do usuário logado (protegida) |
| /usuarios/:id | Perfil público |
| /moderacao | Painel de moderação (apenas moderadores) |
| /sobre | Como funciona e regras da comunidade |
| * | Página 404 |

## Estrutura de pastas
- `src/components` — layout (Header, Footer, Navigation, busca, notificações, menu do usuário, bandeja de comparação, rota protegida)
- `src/components/common` — componentes reutilizáveis (Button, Card, Modal, Field, ScoreMeter, ScalePicker, VoteControl, ReportButton, Icon...)
- `src/components/discipline` — abas e formulários da página da disciplina
- `src/components/profile` — blocos do perfil (cabeçalho, selos, histórico de contribuições)
- `src/contexts` — estado global: autenticação, avisos (toasts), comparação e dados do portal
- `src/hooks` — `useAsync` (chamadas à API), `useRequireAuth`, `useDocumentTitle`
- `src/pages` — uma página para cada rota
- `src/services` — configuração do Axios (token automático) e funções de requisição à API
- `src/styles` — variáveis, estilos globais, layout, componentes e páginas
- `src/utils` — formatação de datas, tamanhos, notas e rótulos

## Responsividade
Layout mobile-first com breakpoints em 480px, 768px, 1024px e 1440px.

## Equipe
- Leonardo de Avila
- Matheus Pelissari
- Pedro Gulin
- Felippe Matias
