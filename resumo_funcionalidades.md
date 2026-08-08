# SmokeTrack — Resumo de Funcionalidades

> Documento gerado para dar contexto completo do app a uma IA externa, ao pedir sugestões de melhoria.

## Visão Geral

SmokeTrack é um app pessoal de **registro e análise de hábitos de fumar** (cigarro, charuto, pod/vape, tabaco, chiclete de nicotina, etc.), com foco em autoconhecimento/redução de consumo — não é um "coach para parar de fumar" com metas/gamificação, e sim uma ferramenta de *quantified self*.

- **Descrição oficial** (`metadata.json`): "Aplicativo para registro e análise detalhada de hábitos de fumar com gráficos estatísticos e exportação de dados."
- **100% local e offline**: todos os dados ficam apenas no `localStorage` do navegador (chave `smoke_track_data`). Não há backend, API, banco de dados, login ou sincronização entre dispositivos.
- **Single-page app** com 3 abas fixas, sem roteador: **Registro**, **Análise**, **Dados** (configurações).
- Todo o estado global vive em `App.tsx` via `useState` (sem Redux/Zustand/Context), persistido no `localStorage` a cada mudança.

## Telas e Funcionalidades

### 1. Registro (`RegisterScreen`)
- Aba inicial padrão.
- Banner com o **tempo decorrido desde o último registro do dia**.
- Formulário para novo registro:
  - Tipo de fumo (dropdown, lista customizável, default "Tabaco" se existir).
  - Data/hora (`datetime-local`, preenchido com o horário atual, respeitando fuso local).
  - Atividade/contexto (dropdown, lista customizável).
  - Botão "Registrar" cria o evento com id gerado via `crypto.randomUUID()`.
- Lista de **registros de hoje** (mais recente primeiro), mostrando horário, tipo, atividade e o **tempo decorrido em relação ao registro anterior** da lista.
- Exclusão de registro individual, com modal de confirmação antes de remover.
- Contador total de registros históricos exibido no cabeçalho do app.

### 2. Análise (`AnalysisScreen`)
Área mais trabalhada do app (evolução recente confirmada pelo histórico de commits: filtros de estratégia/dias, correções de gráfico diário invertido, novas médias, melhorias visuais).

**Filtros disponíveis** (aplicados em conjunto):
- **Período de Análise**: 3 / 7 / 14 / 30 / 60 / 90 dias, ou Total.
- **Dias de Análise**: Total / apenas dias de semana / apenas finais de semana.
- **Estratégia de Análise**: Total (soma) vs. Média (por dia) — afeta os gráficos de dia da semana e de horário.

**Indicadores e gráficos**:
- Tabela de **Médias**: média diária (excluindo o dia de hoje), média em dia de semana e média em fim de semana (dividindo pelo nº de dias distintos observados em cada bucket, não pelo tamanho do período).
- Gráfico de linha **"Fumo por Dia"**: contagem diária no período + linha de **média móvel de 7 dias**.
- Gráfico de barras **"Fumo por Dia da Semana"** (Dom–Sáb), colorido, respeitando o filtro Total/Média.
- Gráfico de barras **"Fumo por Horário"** (0h–23h), respeitando o filtro Total/Média.
- Gráfico de barras horizontal **"Fumo por Atividade"** (top 5 mais frequentes).
- Gráfico de barras **"Por Tipo de Fumo"** (top 5 mais frequentes).
- Todos os gráficos usam `recharts`, com paleta índigo consistente, tooltips arredondados e responsivos.

### 3. Dados / Configurações (`SettingsScreen`)
- **Gerenciar listas** customizáveis: adicionar/remover tipos de fumo e atividades (tags), via modal com input simples.
- **Backup (export)**: gera um JSON de todos os dados (`records`, `smokingTypes`, `activities`), exibido em textarea com botão "Copiar JSON" (clipboard).
- **Restauração (import)**: colar um JSON em textarea e importar; a importação é **aditiva** (concatena registros novos aos existentes e mescla listas de tipos/atividades via `Set`, sem duplicar), com validação de formato (`services/validators.ts`) e feedback visual de sucesso/erro.
- Versão do app exibida no rodapé (ex.: `v1.21`).

## Modelo de Dados

```ts
interface SmokingRecord {
  id: string;        // UUID
  smokeType: string;  // ex: "Cigarro", "Pod", "Tabaco"
  dateTime: string;   // ISO 8601
  activity: string;   // ex: "Trabalhando", "Bar", "Estudando"
}

interface AppData {
  records: SmokingRecord[];
  smokingTypes: string[];
  activities: string[];
}
```

- Tipos de fumo iniciais: Cigarro, Meio charuto, Charuto inteiro, Cigarrilha/Purito, Tabaco, Pod, Chiclete de nicotina.
- Atividades iniciais: Estudando, Aula, Reunião Velt, Reunião Trabalho, Trabalhando, Jogando LoL, Bar, Festa, Social com amigos, Nada em especial.
- Não há entidades de humor, fissura ("craving"), gastos financeiros ou saúde — só o evento de fumar com dois rótulos categóricos.

## Stack Técnica

- **Frontend**: React 19 + TypeScript, Vite 6.
- **Estilo**: Tailwind CSS.
- **Gráficos**: Recharts 3.
- **Datas**: date-fns 4.
- **Ícones**: lucide-react.
- **PWA**: `vite-plugin-pwa` (service worker autoUpdate/Workbox), manifest com nome "Stop Smoking", instalável, ícones 192/512px, tema escuro (`#0f172a`).
- **Empacotamento mobile**: Capacitor (`@capacitor/core`, `@capacitor/ios`) para gerar wrapper iOS a partir do build web; sem plugins nativos (sem notificações nativas, câmera, etc.); sem configuração Android.
- **Deploy**: GitHub Pages via `gh-pages` (`npm run deploy`).
- Sem testes automatizados, sem CI configurado.

## Roadmap / TODOs já anotados pelo próprio dev (`README.md`)

**Prioridade:**
- Tempo médio entre registros de fumo.
- Corrigir cálculo de média quando filtra por "dias de análise".
- Média de dia de semana / fim de semana não deveria contar o dia atual.

**Não prioritário:**
- Considerar madrugada até 5h como pertencente ao "dia anterior".
- Redefinir "fim de semana" como sexta 18h até segunda 5h.
- Testes unitários.
- Refatoração (extrair funções para helpers, reduzir complexidade/duplicação).
- Filtro por intervalo de datas customizado (time range picker).

## Limitações Atuais (útil para direcionar sugestões de melhoria)

- Sem sincronização entre dispositivos ou contas de usuário — dados presos ao `localStorage` de um navegador.
- Sem notificações, lembretes ou alertas (ex.: "já faz muito tempo sem fumar" ou o contrário).
- Sem metas de redução, conquistas/gamificação ou acompanhamento de progresso ao longo do tempo.
- Sem cálculo de custo financeiro (gasto estimado com cigarros/pods).
- Sem edição de um registro existente — só é possível criar ou excluir.
- Import/export apenas manual via texto JSON colado (sem arquivo, sem backup automático/nuvem).
- Sem dark mode, idioma alternativo ou preferências de usuário configuráveis.
- Sem autenticação — qualquer pessoa com acesso ao navegador acessa e edita os dados.
