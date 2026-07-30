# Base pública do Momento Kinder Ovo

Histórico do quadro **Kinder Ovo** do podcast **Foro de Teresina** (revista piauí),
reconstruído episódio a episódio a partir do áudio.

Download: `https://kinderovo.com/dados/`

## Como usar isto

**Baixe e embuta na sua infra.** Não é um endpoint para consumo em produção — é um
snapshot para download. A base inteira tem ~66 KB comprimida e muda uma vez por semana
(o Foro sai às sextas), então buscar em rede a cada partida só adiciona latência e um
ponto de falha. Copie os arquivos para o seu projeto e, quando quiser a versão nova,
baixe de novo. O campo `generatedAt` no `meta.json` diz a idade do snapshot.

| Arquivo | O que é |
| --- | --- |
| `meta.json` | Cobertura, método, ressalvas e índice. **Leia primeiro.** |
| `rounds.json` | Uma entrada por rodada (episódio). É o arquivo principal. |
| `panelists.json` | Ranking agregado da bancada: aparições, vitórias, taxa de vitória, vitórias por ano. |
| `figures.json` | Figuras públicas que já caíram no quadro, com contagem, Wikipédia e foto. |
| `rounds.csv` | Espelho achatado de `rounds.json`, uma linha por rodada. |
| `panel_results.csv` | Formato longo: uma linha por (rodada, comentarista). Bom para join/scoring. |

CSV e JSON têm o mesmo conteúdo — escolha um. CSV se o caminho for pipeline de dados,
JSON se for direto pro front.

## Uma rodada

```json
{
  "roundId": "ko-4727",
  "episodeId": 4727,
  "episodeNumber": null,
  "title": "Os rolos de Flávio, as articulações de Lula e a jogada de Ciro",
  "publishedAt": "2026-07-24T09:35:00-03:00",
  "durationSeconds": 4298,
  "audioUrl": "https://traffic.megaphone.fm/...mp3",
  "spotifyUrl": null,
  "hasKinderOvo": true,
  "answer": {
    "publicFigure": "Eduardo Girão",
    "publicFigures": [
      { "name": "Eduardo Girão", "wikipediaUrl": "...", "imageUrl": "...", "description": "..." }
    ]
  },
  "panel": {
    "participants": ["Fernando de Barros e Silva", "Ana Clara Costa", "Celso Rocha de Barros"],
    "winners": ["Celso Rocha de Barros"],
    "isTie": false,
    "noWinnerRecorded": false,
    "results": [
      { "name": "Fernando de Barros e Silva", "outcome": "did_not_win" },
      { "name": "Ana Clara Costa", "outcome": "did_not_win" },
      { "name": "Celso Rocha de Barros", "outcome": "winner" }
    ]
  },
  "quality": {
    "confidence": 0.94,
    "hasWinner": true,
    "hasPublicFigure": true,
    "playable": true
  }
}
```

## O que dá para montar com isso

- **Pergunta do jogo**: `answer.publicFigure` é a resposta; `figures.json` traz foto e
  descrição para a tela de revelação; `audioUrl`/`spotifyUrl` levam ao episódio de origem.
- **Comparação com a bancada**: filtre `quality.playable === true` e compare rodada a
  rodada — "você acertou esta; o Celso levou essa aí".
- **Leaderboard de referência**: `panelists.json` já vem com `wins`, `appearances`,
  `winRate` e `winsByYear`.
- **Dificuldade**: a frequência em `figures.json` funciona como proxy — quem aparece
  seis vezes é mais reconhecível que quem apareceu uma.

## Ressalvas que importam para o jogo

1. **A base registra quem VENCEU a rodada, não o palpite de cada comentarista.**
   `did_not_win` quer dizer "não levou aquela rodada", não necessariamente "errou".
   Por isso `winRate` é taxa de **vitória**, não de acerto — comparar o acerto bruto do
   jogador com o `winRate` da bancada não é maçã com maçã (o jogador joga sozinho, o
   comentarista disputa com mais dois). Comparação rodada a rodada é justa; comparação
   de percentuais agregados não é.
2. **Nem toda rodada tem vencedor identificado.** Algumas têm o quadro e a figura, mas o
   programa não deixa claro quem levou (apelido, empate implícito, áudio ambíguo). Elas
   servem de pergunta, não de referência da bancada — daí o `quality.playable`.
3. **Extração automática.** Transcrição dos ~20 minutos finais + LLM. A rodada da semana
   passa por revisão humana; o histórico tem correções pontuais. `quality.confidence`
   permite um corte mais conservador.
4. **`episodeNumber` pode ser nulo** nos episódios recentes (o `#NNN` sumiu do título).
   A chave estável é `roundId` / `episodeId`.
5. **Não há timestamp do início do quadro** — sabe-se apenas que está nos ~20 minutos
   finais do episódio.

## Crédito

Dados: [Momento Kinder Ovo](https://kinderovo.com), por Vitor Mafra. Uso livre com crédito.
