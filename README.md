# 🐾 Kaizoo — Mexa-se. Evolua. Divirta-se!

Kaizoo é um aplicativo de fitness gamificado que transforma seus treinos em uma jornada divertida!  
Cuide de mascotes únicos, complete desafios personalizados e construa hábitos saudáveis com leveza e evolução contínua.

---

## 🧭 Contexto
A prática de exercícios físicos está diretamente ligada à saúde física e mental, mas manter uma rotina ativa pode ser desafiador. Falta de tempo, cansaço e a ausência de motivação contínua fazem muitas pessoas desistirem antes de criar o hábito. Além disso, a maioria dos apps disponíveis no mercado são técnicos demais, voltados para performance, e não acolhem iniciantes ou pessoas em busca de leveza e bem-estar.

---

## 🚀 Proposta
Desenvolvemos o **Kaizoo**, um aplicativo de fitness gamificado que transforma o ato de se exercitar em uma jornada divertida e recompensadora. Inspirado na filosofia do _Kaizen_ (melhoria contínua), o Kaizoo incentiva a constância com leveza, mascotes evolutivos, desafios personalizados e recompensas simbólicas. Cada pequeno progresso é celebrado, tornando o autocuidado algo acessível, visual e motivador.

---

## 📊 Pesquisa Quantitativa
- **70%** têm dificuldade em manter motivação.  
- **60%** praticam exercícios de forma leve/moderada.  
- **85%** se sentiriam mais motivados com gamificação e recompensas.  
- **55%** já abandonaram apps de treino por acharem entediantes.

**Conclusão:** existe uma forte demanda por uma solução leve, divertida e focada em progressos diários.

---

## 🔎 Análise de Concorrentes
**STRAVA** → forte interação social e desafios, mas foco técnico em performance.  
**Nike Training Club** → treinos guiados para diferentes níveis, mas baixa interação comunitária.  
**Adidas Running** → gamificação com medalhas, mas muitas funções apenas na versão paga.

---

## 🧠 Inspirações Criativas
- **Tamagochis**: mascotes que evoluem com cuidado.  
- **Pokémon**: misturas de animais únicos e evolutivos.  
- **Dumb Ways to Die**: estilo divertido e descontraído.  
- **Filosofia Kaizen**: pequenas melhorias diárias para evolução constante.

---

## 🎯 Público-alvo
**Mulheres e homens de 25 a 35 anos**, moradores de centros urbanos, com rotina intensa e dificuldade de manter constância nos treinos.  
Valorizam praticidade, recompensas simbólicas, mascotes e elementos de progresso visual.

| Critério       | Perfil                                     |
| -------------- | ------------------------------------------ |
| Idade          | 25 a 35 anos                               |
| Gênero         | Predominantemente feminino (mas inclusivo) |
| Classe social  | Média a média-alta                         |
| Localização    | Centros urbanos                            |
| Estilo de vida | Ativo ou tentando ser                      |
| Motivações     | Saúde, estética, disposição e bem-estar    |
| Barreiras      | Falta de tempo, rotina puxada, filhos      |

---

## 👤 Persona
**Juliana Costa**, 27 anos, analista de marketing, vive em Curitiba.  
Rotina agitada com filha pequena, já tentou usar apps de fitness mas sente falta de motivação contínua.  
Adora visualizar progresso, valoriza recompensas e precisa de treinos curtos e realistas.

> 🧠 _“Eu quero me exercitar, mas preciso de uma ajudinha pra não desistir.”_

---

## ⚙️ Funcionalidades do App
0. Onboarding (concluído!)  
1. Cadastro e autenticação de usuário (concluído!)  
2. Escolha do mascote (concluído!)  
3. Registro de atividades físicas (em desenvolvimento)  
4. Monitoramento de progresso (em desenvolvimento)  
5. Comunidade e eventos temáticos (em desenvolvimento)

---

## 🎨 Identidade Visual
- Estilo **cartoon** com cores suaves.  
- Mascotes evolutivos como elo emocional.  
- Interface limpa, modular (inspirada em Bento Design).  
- Cards independentes para progresso, desafios e conquistas.

---

# 🧩 Integrações: Backend, Banco e Mocks

### 🌐 Ambientes & Links
- **Web (Vercel):** https://kaizoo-mobile.vercel.app  
- **Backend (Render):** https://kaizoo-backend.onrender.com  
- **Frontend Repo:** https://github.com/pateihara/Kaizoo-Mobile  
- **Backend Repo:** https://github.com/pateihara/Kaizoo-mobile-backend

### 🏗️ Stack Técnica
- **Frontend:** React Native + Expo (expo-router) • TypeScript  
- **Backend:** Node.js + Express + Prisma  
- **Banco:** PostgreSQL **Neon** (serverless)  
- **Auth:** JWT (access + refresh)  
- **Deploy:** Vercel (web) • Render (API)

### 📡 Mapa de Integrações por Módulo
| Módulo / Tela           | Integração              | Fonte de Dados         | Observações |
|-------------------------|-------------------------|------------------------|-------------|
| **Auth (login/register)** | **API real**            | Render + Neon          | `POST /auth/register` • `POST /auth/login` |
| **Onboarding (finish)** | **API real**            | Render + Neon          | `POST /profile/finish-onboarding` salva mascote escolhido |
| **Perfil (foto)**       | **API real**            | Render + S3/FS*        | `PUT /profile/photo` (Image Picker na API nova) |
| **Atividades**          | **API real**            | Render + Neon          | `GET/POST /activities` (estimativa de calorias no app) |
| **Desafios – listar**   | **API real**            | Render + Neon          | `GET /challenges` |
| **Desafios – ativar**   | **API real**            | Render + Neon          | `POST /challenges/activate` (espelha `sourceId`) |
| **Desafios – completar**| **API real**            | Render + Neon          | `POST /challenges/complete` (+XP) |
| **Eventos Comunidade**  | **API real**            | Render + Neon          | `GET /community/events` • `POST /community/join` (`sourceId` e `fromEvent`) |
| **Posts/Feed**          | **API real → fallback** | Render + Neon → **seed** | `GET /community/posts`. Se **404**, a UI usa **seed** local |
| **Likes/Comentários**   | **API real → fallback** | Render + Neon → **seed** | `POST /community/posts/:id/like` • `POST /community/posts/:id/comments` com **contagem sincronizada** |

### 🔀 Alternar entre API real e Mock (seed)
No **app** há uma flag pública:

```env
EXPO_PUBLIC_USE_SEED=false   # false = API real; true = força mocks/seed
```

Para **erros 404/sem backend**, algumas telas (ex.: Comunidade) **ativam fallback** automático para seed local.

### 🧭 Endpoints (resumo)
- **Auth:** `POST /auth/register`, `POST /auth/login`  
- **Profile:** `POST /profile/finish-onboarding`, `PUT /profile/photo`  
- **Activities:** `GET /activities`, `POST /activities`  
- **Challenges:** `GET /challenges`, `POST /challenges/activate`, `POST /challenges/complete`  
- **Community:** `GET /community/posts`, `POST /community/posts/:id/like`, `POST /community/posts/:id/comments`, `GET /community/events`, `POST /community/join`

---

## 🖼️ Galeria & Comentários (Front-only)

A **Galeria** (`/galeria`) e o **Detalhe do Post** (`/galeria/[id]`) funcionam hoje **100% no frontend**.

- As imagens dos posts são **URIs locais** da galeria do dispositivo (`imageUri`), sem upload para o backend.
- Comentários/likes tentam a **API real**; se indisponível, a UI mantém **estado otimista** e **fallback** (seeds) para não quebrar a experiência.
- A contagem de comentários/likes é sincronizada entre telas via **event bus**:
  - `community:postAdded` — emitido ao publicar um post (galeria recarrega).
  - `community:commentAdded` — emitido ao comentar no detalhe (feed/galeria atualizam o contador).

**Fluxo de comentário (optimistic)**
1. Adiciona comentário “temp-*” na lista e zera o input.  
2. Tenta `POST /community/posts/:id/comments` (se o backend estiver ativo).  
3. Se ok, substitui o “temp” pelo objeto persistido e **incrementa** o contador do post.  
4. Emite `community:commentAdded` para sincronizar outras telas.  
5. Se falhar, remove o “temp” (rollback).

**Limitação atual**
- **Não há upload de imagem para storage** (S3/Cloudinary/FS remoto). Para persistir mídia e compartilhar entre dispositivos, será necessário integrar um **storage** no backend e trocar `imageUri` por `imageUrl` remota.

---

# 🛠️ Arquitetura Técnica e Desenvolvimento

- **Estilização:** Atomic Design (atoms, molecules, organisms, templates) + `src/theme` (tokens `colors`, `spacing`, `radius`)  
- **Estado:** Context/Zustand (ex.: `ActivityContext` com progresso/XP e “espelho” de desafios ativos)  
- **Acessibilidade:** contraste adequado, botões grandes, navegação simplificada  
- **Mobile/Web:** Expo (Android/iOS) e **Expo Web** (deploy na Vercel)  
- **Controle de Versão:** GitHub

---

## 🔐 Variáveis de Ambiente

### App (frontend – `Kaizoo-Mobile`)
Crie o arquivo `.env` a partir do exemplo:

```env
# URL pública do backend
EXPO_PUBLIC_API_URL=https://kaizoo-backend.onrender.com

# Para testar localmente com celular físico:
# EXPO_PUBLIC_API_URL=http://192.168.xxx.xxx:4000

# Forçar uso de mocks/seed (p/ desenvolvimento)
EXPO_PUBLIC_USE_SEED=false
```

### Backend (referência – `Kaizoo-mobile-backend`)
```env
# Banco de dados Neon
DATABASE_URL="postgresql://USUARIO:SENHA@HOST/neondb?sslmode=require&channel_binding=require"

# JWT
JWT_ACCESS_SECRET="sua_chave_super_secreta"
JWT_REFRESH_SECRET="sua_chave_refresh_super_secreta"

# Expiração
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL="30d"
```

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- Node.js (>= 18) • Expo CLI • Git • App **Expo Go** no celular

### Rodar o frontend
```bash
git clone https://github.com/pateihara/Kaizoo-Mobile
cd Kaizoo-Mobile
npm install
cp .env.example .env   # (se existir) ou crie .env usando o bloco acima
npx expo start --clear
```
Escaneie o QR Code com o **Expo Go**.

### Rodar o backend
```bash
git clone https://github.com/pateihara/Kaizoo-mobile-backend
cd Kaizoo-mobile-backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```
Por padrão: `http://localhost:4000` (ou conforme seu `PORT`).

---

## ⚠️ Observação sobre o backend e localhost
No **frontend**, ajuste `EXPO_PUBLIC_API_URL`:

- **Emulador** (Android/iOS na mesma máquina do backend):  
  - Android Emulator: `http://00.0.0.0:4000`  
  - iOS Simulator: `http://localhost:4000`
- **Celular físico via Expo Go:** use o **IP da sua máquina** (ex.: `http://000.000.0.00:4000`).  
  Se necessário, rode o Expo com `--host tunnel`.

Descubra seu IP com `ipconfig` (Windows) ou `ifconfig` (Linux/Mac).

---


## 🛟 Troubleshooting

- **404 `/community/posts`**: Render pode “acordar” na 1ª chamada. Em falha, a **tela usa seed** local para manter UX.  
- **401 `missing_token`**: confira login, envio do header `Authorization: Bearer <token>`.  
- **Expo cache**: `npx expo start --clear`.  
- **Android físico não acessa o backend local**: use IP da máquina + `--host tunnel`.  
- **Image Picker**: preferir `ImagePicker.MediaType.IMAGES` (API nova) para evitar avisos deprecatados.

---

## 🧪 Testes rápidos (manuais)

- [ ] Criar conta → selecionar mascote → concluir onboarding (API real)  
- [ ] Trocar foto do perfil (Image Picker + API real)  
- [ ] Criar atividade (20 min caminhada) → ver calorias estimadas (app)  
- [ ] Listar/ativar desafio disponível (API real) → aparece em “Ativos”  
- [ ] Entrar em evento de comunidade → desafio marcado com `fromEvent`  
- [ ] Comentar post da comunidade → contagem total atualiza (API real; se 404, seed)  
- [ ] Abrir **/galeria** → ver apenas meus posts; abrir **/galeria/[id]** e comentar (evento sincroniza feed)

---

## 🔗 Links Importantes
- 🎬 Vídeo Pitch: https://www.youtube.com/watch?v=YhCOFLgWKoE  
- 🎨 Marca (Canva): https://www.canva.com/design/DAGl200Eld0/vIQVUn-K3Q9dTUG8oYHVBQ/view  
- 🧪 Protótipo Figma: https://www.figma.com/proto/pVsIoJEYtDM3A3XYC5iQfM/KAIZOO---ENTERPRISE-CHALLENGE  
- 📦 Frontend (GitHub): https://github.com/pateihara/Kaizoo-Mobile  
- 📦 Backend (GitHub): https://github.com/pateihara/Kaizoo-mobile-backend  
- 🌐 Web (Vercel): https://kaizoo-mobile.vercel.app  
- 🖥️ Backend (Render): https://kaizoo-backend.onrender.com

---

## 👥 Equipe
- **Natalia Guaita** → Planejamento e design  
- **Patricia Eihara** → Planejamento e desenvolvimento  
- **Rafael Santos** → Planejamento, atualizações e videomaker

---

## 📜 Licença
MIT © Kaizoo
