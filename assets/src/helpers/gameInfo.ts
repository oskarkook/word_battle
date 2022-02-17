export interface GameInfo {
  node: string;
  game_id: string;
  token: string;
}

export function getLocalGameInfo(): GameInfo | undefined {
  const gameInfo = sessionStorage.getItem("game_info");
  if(gameInfo) {
    return JSON.parse(gameInfo) as GameInfo;
  }

  return undefined;
}

export function setLocalGameInfo(gameInfo: GameInfo) {
  sessionStorage.setItem("game_info", JSON.stringify(gameInfo));
}