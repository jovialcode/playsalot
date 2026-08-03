import type { GameCatalogEntry } from "@playsalot/shared-types";
import type { DesignGame } from "@/types/game";

export const DESIGN_GAMES: DesignGame[] = [
  {id:'gem-merchants', name:'젬마스터', category:'보드', playersLabel:'2인', minP:2, maxP:2, activeNow:0, isNew:true, isPlayable:false, supportsBot:true, image:'/images/games/gem-merchants.png',
   desc:'보석으로 상단 카드를 영입해 할인 엔진을 만들고 왕실의 선택을 받으세요.',
   rules:['시장에서는 서로 다른 보석을 최대 2개 가져와요','카드 비용은 보석과 이미 영입한 카드의 할인으로 지불해요','카드는 점수와 영구 보석 할인을 줘요','먼저 명성 12점을 모으면 승리해요'],
   tint:'var(--warn-tint)', tintDeep:'#6E4A1A'},
  {id:'uno', name:'라스트원', category:'카드', playersLabel:'2-8인', minP:2, maxP:8, activeNow:3842, isNew:false, isPlayable:false, supportsBot:false, image:'/images/games/uno.png',
   desc:'숫자와 색을 맞춰 손에 든 카드를 모두 내는 정통 카드 게임.',
   rules:['카드 7장으로 시작해요','낸 카드와 같은 색이나 숫자를 내요','낼 카드가 없으면 카드를 한 장 가져와요','카드가 한 장 남으면 "라스트원"을 외쳐요'],
   tint:'var(--sage-tint)', tintDeep:'var(--sage-deep)'},
  {id:'halli', name:'파이브벨', category:'반응', playersLabel:'2-6인', minP:2, maxP:6, activeNow:1205, isNew:true, isPlayable:false, supportsBot:false, image:'/images/games/halli.png',
   desc:'같은 과일이 정확히 5개가 되는 순간, 종을 먼저 치세요.',
   rules:['과일 카드를 한 장씩 순서대로 뒤집어요','같은 과일이 정확히 5개가 되면 종을 쳐요','가장 먼저 친 사람이 테이블의 카드를 모두 가져가요','카드를 다 가져간 사람이 승리해요'],
   tint:'var(--coral-tint)', tintDeep:'var(--coral-deep)'},
  {id:'burumable', name:'리치타운', category:'보드', playersLabel:'2인', minP:2, maxP:2, activeNow:2976, isNew:false, isPlayable:false, supportsBot:false, image:'/images/games/burumable.png',
   desc:'땅을 사고 통행료를 걷으며, 파산을 피해 살아남는 보드 게임.',
   rules:['주사위를 굴려 말을 이동해요','도착한 땅을 사거나 통행료를 내요','건물을 올려 통행료를 올려요','파산하지 않고 가장 오래 남으면 승리해요'],
   tint:'var(--warn-tint)', tintDeep:'#6E4A1A'},
  {id:'mafia', name:'마피아/스파이', category:'파티', playersLabel:'4-12인', minP:4, maxP:12, activeNow:2340, isNew:false, isPlayable:false, supportsBot:false, image:'/images/games/mafia.png',
   desc:'누가 거짓말을 하는지, 대화만으로 밝혀내는 심리 게임.',
   rules:['역할을 배정받아요 (시민 · 마피아 · 스파이)','낮에는 대화로 마피아를 추리해요','투표로 한 명을 지목해 제거해요','마피아를 모두 찾거나 마피아가 살아남으면 끝나요'],
   tint:'var(--danger-tint)', tintDeep:'var(--danger)'},
  {id:'omok', name:'오목', category:'전략', playersLabel:'2인', minP:2, maxP:2, activeNow:612, isNew:true, isPlayable:false, supportsBot:false, image:'/images/games/omok.png',
   desc:'가로, 세로, 대각선 중 하나로 다섯 개를 먼저 이으면 승리해요.',
   rules:['흑과 백이 번갈아 돌을 놓아요','가로 · 세로 · 대각선 중 하나로 5개를 이으면 승리해요','먼저 5개를 이은 사람이 승리해요'],
   tint:'var(--success-tint)', tintDeep:'var(--success)'},
  {id:'chess', name:'체스', category:'전략', playersLabel:'2인', minP:2, maxP:2, activeNow:1488, isNew:false, isPlayable:false, supportsBot:false, image:'/images/games/chess.png',
   desc:'64칸 위에서 벌어지는 가장 오래된 두뇌 싸움.',
   rules:['말마다 정해진 방식으로 움직여요','상대의 말을 잡으며 판을 장악해요','상대의 킹을 체크메이트하면 승리해요'],
   tint:'var(--success-tint)', tintDeep:'var(--success)'},
  {id:'mancala', name:'만칼라', category:'보드', playersLabel:'2인', minP:2, maxP:2, activeNow:0, isNew:true, isPlayable:false, supportsBot:true, image:'/images/games/mancala.png',
   desc:'구덩이의 씨앗을 뿌려 내 창고에 더 많이 모으는 오래된 셈 게임.',
   rules:['내 구덩이 하나를 골라 씨앗을 시계 반대 방향으로 하나씩 놓아요','마지막 씨앗이 내 창고에 들어가면 한 번 더 둬요','비어 있던 내 구덩이에 마지막 씨앗이 놓이면 맞은편 씨앗까지 가져와요','한쪽 구덩이가 모두 비면 창고에 씨앗이 많은 사람이 승리해요'],
   tint:'var(--warn-tint)', tintDeep:'#6E4A1A'},
  {id:'dots', name:'점과 상자', category:'전략', playersLabel:'2인', minP:2, maxP:2, activeNow:0, isNew:true, isPlayable:false, supportsBot:true, image:'/images/games/dots.png',
   desc:'선을 이어 상자를 완성하고, 더 많은 칸을 차지하세요.',
   rules:['번갈아 이웃한 두 점을 선으로 이어요','네 변을 모두 채워 상자를 완성하면 그 칸을 차지하고 한 번 더 둬요','완성한 상자가 없으면 상대에게 차례가 넘어가요','모든 칸이 채워졌을 때 상자를 더 많이 가진 사람이 승리해요'],
   tint:'var(--success-tint)', tintDeep:'var(--success)'},
];

export const CATEGORIES = ['전체','카드','반응','보드','파티','전략'];

const CATALOG_GAME_IMAGES: Record<string, string> = {
  yutnori: "/images/games/yutnori.png",
  battleship: "/images/games/battleship.png",
  gostop: "/images/games/gostop.png",
  president: "/images/games/president.png",
};

export function createLobbyGames(catalog: GameCatalogEntry[]): DesignGame[] {
  const catalogById = new Map(catalog.map((game) => [game.id, game]));

  const designedGames = DESIGN_GAMES.map((game) => {
    const playableGame = catalogById.get(game.id);
    return {
      ...game,
      isPlayable: !!playableGame,
      supportsBot: playableGame?.supportsBot ?? false,
      minP: playableGame?.minPlayers ?? game.minP,
      maxP: playableGame?.maxPlayers ?? game.maxP,
      playersLabel: playableGame
        ? `${playableGame.minPlayers === playableGame.maxPlayers ? playableGame.maxPlayers : `${playableGame.minPlayers}-${playableGame.maxPlayers}`}인`
        : game.playersLabel,
    };
  });

  const knownIds = new Set(DESIGN_GAMES.map((game) => game.id));
  const undesignedGames = catalog
    .filter((game) => !knownIds.has(game.id))
    .map<DesignGame>((game) => ({
      id: game.id,
      name: game.displayName,
      category: "보드",
      playersLabel: `${game.minPlayers === game.maxPlayers ? game.maxPlayers : `${game.minPlayers}-${game.maxPlayers}`}인`,
      minP: game.minPlayers,
      maxP: game.maxPlayers,
      activeNow: 0,
      isNew: true,
      desc: "새로 추가된 게임입니다.",
      rules: [],
      tint: "var(--sage-tint)",
      tintDeep: "var(--sage-deep)",
      image: CATALOG_GAME_IMAGES[game.id],
      isPlayable: true,
      supportsBot: game.supportsBot,
    }));

  return [...designedGames, ...undesignedGames];
}
