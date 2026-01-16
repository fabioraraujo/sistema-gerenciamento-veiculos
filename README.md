# Sistema de Gerenciamento de Veículos

Aplicação full-stack para gerenciamento de frota de veículos, desenvolvida com React, tRPC, Express e MySQL.

## 📁 Estrutura do Projeto

```
veiculos-app/
├── frontend/                 # Aplicação React (Vite)
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   └── ui/           # Componentes shadcn/ui
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilitários e configurações
│   │   └── contexts/         # Contextos React
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # API Express + tRPC
│   ├── src/
│   │   ├── routes/           # Rotas tRPC
│   │   ├── db/               # Schema e queries do banco
│   │   └── index.ts          # Entry point do servidor
│   ├── drizzle/              # Migrações do banco
│   └── package.json
│
├── package.json              # Scripts do workspace
└── README.md
```

## 🚀 Funcionalidades

-   **CRUD completo de veículos**: Cadastro, listagem, edição e exclusão
-   **Campos**: Placa, marca, modelo, ano, cor e status (ativo/inativo)
-   **Filtros avançados**: Por marca, modelo e status
-   **Paginação**: Listagem paginada com controle de itens por página
-   **Validação**: Validação de dados com Zod no frontend e backend
-   **Interface responsiva**: Design elegante com Tailwind CSS e shadcn/ui
-   **Documentação API**: Swagger UI disponível em `/api/docs`

## 📋 Pré-requisitos

-   **Node.js** 20 ou superior
-   **npm** ou **pnpm**
-   **MySQL** 8.0 ou superior

## 🔧 Instalação

### 1. Clone ou extraia o projeto

```bash
cd veiculos-app
```

### 2. Instale as dependências

```bash
# Instalar dependências do workspace
npm install

# Instalar dependências do backend
cd backend && npm install && cd ..

# Instalar dependências do frontend
cd frontend && npm install && cd ..
```

### 3. Configure o banco de dados

Crie o banco de dados MySQL:

```sql
CREATE DATABASE veiculos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure as variáveis de ambiente

Crie o arquivo `backend/.env`:

```env
DATABASE_URL="mysql://root:sua_senha@localhost:3306/veiculos_db"
PORT=3000
```

### 5. Execute as migrações

```bash
cd backend
npm run db:generate
npm run db:migrate
cd ..
```

### 6. Inicie a aplicação

**Opção 1: Rodar frontend e backend separadamente**

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**Opção 2: Rodar ambos juntos**

```bash
npm run dev
```

### 7. Acesse a aplicação

-   **Frontend**: http://localhost:5173
-   **Backend API**: http://localhost:3000
-   **Swagger Docs**: http://localhost:3000/api/docs

## 📚 Scripts Disponíveis

### Raiz do projeto

| Comando         | Descrição                                         |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | Inicia frontend e backend em modo desenvolvimento |
| `npm run build` | Compila frontend e backend para produção          |
| `npm run start` | Inicia o servidor de produção                     |
| `npm run test`  | Executa os testes do backend                      |

### Backend (`/backend`)

| Comando               | Descrição                               |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Inicia servidor em modo desenvolvimento |
| `npm run build`       | Compila TypeScript para JavaScript      |
| `npm run start`       | Inicia servidor de produção             |
| `npm run test`        | Executa testes com Vitest               |
| `npm run db:generate` | Gera migrações do Drizzle               |
| `npm run db:migrate`  | Aplica migrações no banco               |

### Frontend (`/frontend`)

| Comando           | Descrição                                    |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Inicia servidor Vite em modo desenvolvimento |
| `npm run build`   | Compila para produção                        |
| `npm run preview` | Preview da build de produção                 |

## 🛠️ Tecnologias Utilizadas

### Frontend

-   **React 19** - Biblioteca UI
-   **TypeScript** - Tipagem estática
-   **Vite** - Build tool
-   **Tailwind CSS 4** - Estilização
-   **shadcn/ui** - Componentes UI
-   **tRPC Client** - Cliente type-safe para API
-   **React Query** - Gerenciamento de estado servidor
-   **Wouter** - Roteamento
-   **Zod** - Validação de schemas
-   **Lucide React** - Ícones

### Backend

-   **Node.js** - Runtime
-   **Express** - Framework HTTP
-   **TypeScript** - Tipagem estática
-   **tRPC** - API type-safe
-   **Drizzle ORM** - ORM para MySQL
-   **Zod** - Validação de schemas
-   **Swagger UI** - Documentação da API

## 📖 API Endpoints

A API utiliza tRPC, então os endpoints são chamados via RPC. A documentação completa está disponível no Swagger UI (`/api/docs`).

### Veículos

| Procedure             | Tipo     | Descrição                              |
| --------------------- | -------- | -------------------------------------- |
| `vehicles.list`       | Query    | Lista veículos com filtros e paginação |
| `vehicles.getById`    | Query    | Busca veículo por ID                   |
| `vehicles.create`     | Mutation | Cria novo veículo                      |
| `vehicles.update`     | Mutation | Atualiza veículo existente             |
| `vehicles.delete`     | Mutation | Remove veículo                         |
| `vehicles.getMarcas`  | Query    | Lista marcas distintas                 |
| `vehicles.getModelos` | Query    | Lista modelos distintos                |

## 🗄️ Schema do Banco de Dados

### Tabela `vehicles`

| Coluna      | Tipo         | Descrição                      |
| ----------- | ------------ | ------------------------------ |
| `id`        | INT          | Chave primária auto-incremento |
| `placa`     | VARCHAR(10)  | Placa do veículo (única)       |
| `marca`     | VARCHAR(100) | Marca do veículo               |
| `modelo`    | VARCHAR(100) | Modelo do veículo              |
| `ano`       | INT          | Ano de fabricação              |
| `cor`       | VARCHAR(50)  | Cor do veículo                 |
| `status`    | ENUM         | 'ativo' ou 'inativo'           |
| `createdAt` | TIMESTAMP    | Data de criação                |
| `updatedAt` | TIMESTAMP    | Data de atualização            |

## 📝 Licença

Este projeto está sob a licença MIT.
