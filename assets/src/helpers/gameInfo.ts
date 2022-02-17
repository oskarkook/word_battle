export interface GameInfo {
  node: string;
  game_id: string;
  token: string;
  dead_at: string;
}

const identifier = "game_info";
export function getLocalGameInfo(): GameInfo | undefined {
  const gameInfo = sessionStorage.getItem(identifier);
  if(gameInfo) {
    return JSON.parse(gameInfo) as GameInfo;
  }

  return undefined;
}

export function setLocalGameInfo(gameInfo: GameInfo) {
  sessionStorage.setItem(identifier, JSON.stringify(gameInfo));
}

export function clearLocalGameInfo() {
  sessionStorage.removeItem(identifier);
}