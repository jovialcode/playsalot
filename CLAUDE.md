# playsalot

실시간 멀티플레이 보드게임 라운지 (Colyseus + Next.js 모노레포). 아키텍처 전반(룸 구조, 상태 동기화, 게임 플러그인 계약, 재접속, 봇 대전 등)은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 먼저 읽을 것 — 여기서는 반복하지 않는다.

## 구현된 게임

등록 순서(`apps/game-server/src/config/register-games.ts`)와 동일. "인원"은 각 `GameDefinition`의 `minPlayers`~`maxPlayers`이며, 매치메이킹은 정원이 다 차야 시작하는 고정 인원 방식이다(ARCHITECTURE.md 참고).

| id | 패키지 | 인원 | 봇 지원 |
|---|---|---|---|
| `omok` | `packages/games/omok` | 2 | ✅ |
| `burumable` | `packages/games/burumable` | 2–4 | ✅ |
| `uno` | `packages/games/uno` | 2–4 | ✅ |
| `halli` | `packages/games/halligalli` | 2–4 | ✅ |
| `yutnori` | `packages/games/yutnori` | 2 | ✅ |
| `battleship` | `packages/games/battleship` | 2 | ✅ |
| `gostop` | `packages/games/gostop` | 2–4 | ✅ |
| `president` | `packages/games/president` | 2–4 | ✅ |
| `gem-merchants` | `packages/games/gem-merchants` | 2 | ✅ |
| `mancala` | `packages/games/mancala` | 2 | ✅ |
| `dots` | `packages/games/dots-and-boxes` | 2 | ✅ |

새 게임 추가 절차는 ARCHITECTURE.md 5번 섹션 그대로: 게임 패키지 생성 → `GameDefinition` 구현 → `apps/game-server/src/config/register-games.ts`에 등록 → `apps/web/src/features/games/game-ui-registry.tsx`에 화면 등록. **새 게임을 만들 때는 반드시 기존 게임(특히 `omok`)의 구현을 참고해서 동일한 컨벤션(`declare` 필드 + 생성자 + `defineTypes()`, CSV 문자열로 가변 길이 데이터 표현, `getCurrentTurnPlayerId`/`chooseBotMove`로 봇 지원)을 따를 것.**

## 모바일 게임 화면 원칙

플레이살롯은 모바일 웹 플레이를 우선한다. **게임 진행에 필요한 판, 상태 정보, 핵심 조작 버튼은 세로 스크롤 없이 하나의 모바일 화면(뷰포트) 안에서 함께 보여야 한다.**

- 게임 UI는 작은 모바일 뷰포트(최소 320px 폭과 일반적인 모바일 세로 높이)를 기준으로 설계한다.
- 게임 판은 가용 공간에 맞춰 반응형으로 축소하고, 상태·조작 UI는 판을 가리거나 화면 밖으로 밀어내지 않는다.
- 부가 정보(규칙, 칸/카드 상세, 기록)는 바텀시트·모달 등으로 필요할 때만 열며, 기본 게임 화면의 스크롤을 유발하지 않는다.
- 안전 영역(`safe-area-inset-*`)과 최소 터치 영역을 고려한다.

## 할리갈리 (`halli`) 구현 메모

실제 할리갈리는 인원 제한이 없는(2~6인) 실시간 반응 게임이지만, 이 프로젝트의 매치메이킹은 "정확히 N명이 다 모여야 시작"하는 고정 인원 방식이고(`BoardGameRoom.onJoin`이 `joinedPlayerIds.length === maxClients`일 때만 시작) 로비에 인원수를 고르는 UI도 없다. 그래서 다른 구현된 게임들과 동일하게 **2인 고정**(`minPlayers = maxPlayers = 2`)으로 스코프를 좁혔다. N인 확장은 로비/매치메이킹 UI 작업이 먼저 필요하다.

핵심 설계:
- 카드 코드는 `${과일}${숫자}` (예: `s3` = 딸기 3개). 과일: `s`딸기 `l`라임 `b`바나나 `p`자두. 덱은 과일당 개수 1~5, 개수가 낮을수록 장수가 많음(5+4+3+2+1)×4종 = 60장 — 5가 되는 매칭이 너무 자주/너무 안 나오지 않도록.
- 각 플레이어는 `decks`(뒤집지 않은 패, CSV, 마지막 원소가 top) / `faceUp`(뒤집어서 쌓은 패, 마지막 원소가 테이블에 보이는 카드) 두 개의 배열을 가진다. uno의 `hands`/`deck` CSV 컨벤션을 그대로 따름.
- **"뒤집기"(flip)는 턴제**(자기 차례에만), **"종치기"(ring)는 턴과 무관하게 언제든** 보낼 수 있다 — 실제 할리갈리처럼 반응 속도 싸움을 재현하려면 종치기를 턴으로 막으면 안 된다. `applyMove`에서 `move.action === "ring"`은 턴 체크를 건너뛰고 바로 처리한다.
- 종치기가 맞으면(현재 보이는 두 top 카드가 같은 과일이고 합이 정확히 5) 양쪽의 `faceUp` 전체를 종친 사람 덱 밑으로 가져간다. 틀리면 종친 사람이 덱 맨 위 카드 1장을 상대에게 준다(줄 카드가 없으면 페널티 없음).
- 봇(`bot.ts`)은 `BoardGameRoom.maybeTriggerBotMove`가 **자기 턴에만** 호출한다는 제약 때문에, "이미 테이블에 매칭이 떠 있으면 종치기, 아니면 뒤집기"로만 판단한다. 그런데 이게 오히려 자연스럽다: 사람이 매칭을 만들어놓고 안 치면, 봇 턴이 됐을 때(약 500ms 후) 봇이 채간다 — 반응 속도 대결이 어느 정도 재현된다.
- 2인 고정이라 "한쪽이 카드 0장이 되는 순간 게임 종료"를 단순 토글(`otherIndex`)로 처리했다 — N인으로 확장 시 `activeIndexes`/`nextActiveIndex` 같은 일반화가 다시 필요해짐(burumable의 `bankrupt` 배열 패턴 참고).

테스트는 `packages/games/halligalli/src/definition.test.ts` — 턴 아닌 뒤집기 거부, 턴 무관 종치기 허용, 정답 종치기 시 카드 전량 획득, 오답 종치기 페널티(카드 있을 때/없을 때), 승리 판정을 커버함. `pnpm --filter @playsalot/game-halligalli test`로 실행.

화면은 `apps/web/src/components/game/HalliGalliBoard.tsx` — 양쪽 top 카드 + 덱 장수, 중앙의 항상 클릭 가능한 🔔 버튼, 내 턴일 때만 활성화되는 뒤집기 버튼으로 구성. 브라우저로 AI 대전 실제 플레이해서 뒤집기/오답 종치기/봇 반응까지 확인함.

## 방 만들기 (초대 코드 + 방장 시작) 구현 메모

"방 만들기" 카드는 `client.create("board-game", { ..., private: true })`로 매치메이킹 풀에서 숨겨진(`setPrivate(true)`) 룸을 새로 만들고, 그 룸의 Colyseus `roomId`를 그대로 초대 코드로 쓴다 — 별도 코드 발급/저장소가 필요 없다. 친구는 `client.joinById(roomId, ...)`로 입장한다.

핵심 설계:
- `BoardGameRoom`은 `options.private`가 true면 `isPrivateRoom` 모드로 들어가서 **정원이 차도 자동으로 시작하지 않는다** — 대신 매 입장마다 `broadcastRoster()`로 `{ gameId, players, hostId, minPlayers, maxPlayers, started }`를 전체 클라이언트에 브로드캐스트하고, 첫 입장자를 `hostPlayerId`로 고정한다. 방장만 보낼 수 있는 `"start-game"` 메시지가 와야(`handleStartGame`) `this.started = true` + `lock()` + `broadcast("game-started", { gameId })`로 실제 게임이 시작된다. `onMessage("move", ...)`는 `isPrivateRoom && !started`면 조용히 무시해서, 대기 중에는 아무도 수를 둘 수 없다.
- 로스터 페이로드에 항상 `gameId`(= `definition.id`)를 담아 보내는 이유: 클라이언트의 "코드로 참가" UI는 **어떤 게임 상세 페이지에서 열렸든** 상관없이 동작해야 한다(우노 페이지에서 오목 방 코드를 입력해도 정상 입장). `useMatch.ts`는 참가 시점엔 `gameId: ""`로 방에 붙고, 서버가 보낸 roster/game-started 메시지의 `gameId`를 신뢰해서 어떤 게임 화면(`getGameScreen`)을 그릴지 결정한다 — 이 흐름을 실제 두 브라우저 탭으로 검증함(우노 상세 페이지에서 오목 방 코드로 참가 → 정상적으로 오목 화면 렌더링, 실시간 착수 동기화 확인).
- 재접속 토큰(`saveReconnectionToken`)은 방 생성/참가 시점이 아니라 **`"game-started"`를 받은 시점에만** 저장한다. 대기실(시작 전) 상태로 새로고침했을 때 재접속하는 흐름은 아직 없음(`page.tsx`의 `tryReconnect`는 "이미 시작된 게임방"만 다시 그릴 줄 안다) — 대기 중 새로고침하면 대기실이 사라지는 게 알려진 한계. 방장이 나가도 룸을 명시적으로 닫진 않음(기존 30초 재접속 유예에 맡김) — 인원 이탈 시 로스터에서 좌석을 빼는 로직도 없음(재접속 지원을 위해 `joinedPlayerIds`를 절대 splice하지 않는 기존 설계를 그대로 따름). 이런 엣지 케이스들을 다루려면 `GameDefinition`에 `removePlayer` 계약을 추가해야 해서 지금 범위 밖으로 남겨둠.

브라우저 탭 두 개로 방 만들기 → 코드 공유 → 참가 → 로스터 실시간 동기화 → 방장 시작 → 실제 대국(오목) 착수 동기화까지 전 과정 확인함.
