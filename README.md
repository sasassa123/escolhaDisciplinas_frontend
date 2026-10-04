# Gangue do Patinete — Frontend

Uma plataforma que reúne tudo o que o estudante precisa para escolher sua disciplina optativa: carga horária real, formato de avaliação, pré-requisitos e custos, relação com a carreira, avaliações verificadas de quem já cursou e vagas em tempo real com alerta, além de uma lista de 1ª, 2ª e 3ª opções já validada contra o horário. Para a pós-graduação, há uma área onde o estudante pode encontrar disciplinas que pode cursar em outras instituições e gerar em PDF a documentação necessária para a solicitação.

Este repositório contém a interface web do projeto. A API fica no repositório [escolhaDisciplinas_api](https://github.com/sasassa123/escolhaDisciplinas_api).

## Stack
React 19, Vite, React Router DOM, Axios, CSS puro (mobile-first)

## Pré-requisitos
- Node.js 18 ou superior
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

## Variáveis de ambiente
| Variável | Descrição | Exemplo |
|---|---|---|
| VITE_API_URL | URL base da API | http://localhost:3001/api |

## Rotas
| Rota | Página |
|---|---|
| / | Home (inclui o teste de conexão com a API) |
| /products | Lista de produtos consumida da API |
| /about | Sobre o projeto |
| /contact | Contato |
| * | Página 404 |

## Estrutura de pastas
- `src/components` — componentes de layout (Header, Footer, Navigation) e teste da API
- `src/components/common` — componentes reutilizáveis (Button, Card, LoadingSpinner)
- `src/pages` — uma página para cada rota
- `src/services` — configuração do Axios e funções de requisição à API
- `src/styles` — estilos globais, variáveis de CSS e layout responsivo
- `src/App.jsx` — definição das rotas
- `src/main.jsx` — ponto de entrada da aplicação

## Responsividade
Layout mobile-first com breakpoints em 480px, 768px, 1024px e 1440px.

## Equipe
- Leonardo de Avila
- Matheus Pelissari
- Pedro Gulin
- Felippe Matias