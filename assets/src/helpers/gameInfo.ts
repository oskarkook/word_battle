export interface GameInfo {
  node: string;
  game_id: string;
  token: string;
}

export function getLocalGameInfo(): GameInfo | undefined {
  const gameInfo = localStorage.getItem("game_info");
  if(gameInfo) {
    return JSON.parse(gameInfo) as GameInfo;
  }

  return undefined;
}

export function setLocalGameInfo(gameInfo: GameInfo) {
  localStorage.setItem("game_info", JSON.stringify(gameInfo));
}