import { globalAlerts } from "$src/global";
import { clearLocalGameInfo, GameInfo } from "$src/helpers/gameInfo";
import { Classification, classifyLetter } from "$src/helpers/letter";
import { Channel, Socket } from "phoenix";
import { writable, get } from "svelte/store";

type PlayerId = string | number;
export interface Game {
  id: string | undefined;
  state: "disconnected" | "connecting" | "waiting" | "running" | "player-done" | "completed";
  game_definition: {
    begin_at: string | undefined;
    finish_at: string | undefined;
    guesses_allowed: number;
    word_length: number;
  };
  player_id: PlayerId;
  player_guesses: {
    [id: PlayerId]: Classification[][];
  },
  solution: string | undefined;
}

type GuessMask = string;
type RemoteGuess = [string | null, GuessMask];
function parseGuess([word, mask]: RemoteGuess): Classification[] {
  const classification: Classification[] = [];
  for(let i = 0; i < mask.length; i++) {
    const type = classifyLetter(mask[i]);
    const letter = word ? word[i] : undefined;
    classification.push({letter, type});
  }

  return classification;
}

function parsePlayerGuesses(guesses: {[id: PlayerId]: RemoteGuess[]}): Game["player_guesses"] {
  const result: Game["player_guesses"] = {};
  Object.keys(guesses).forEach(playerId => {
    if(!result[playerId]) result[playerId] = [];
    guesses[playerId].reverse().forEach(guess => {
      result[playerId].push(parseGuess(guess));
    });
  });
  return result;
}

function updateGameState(game: Game): void {
  const now = new Date();
  const beginAt = new Date(game.game_definition.begin_at);

  if(now < beginAt) {
    game.state = "waiting";
    return;
  }

  const guesses = game.player_guesses[game.player_id];
  if(game.solution === undefined && guesses.length > 0 && guesses[guesses.length - 1].every(({type}) => type === "correct")) {
    game.solution = guesses[guesses.length - 1].map(({letter}) => letter).join("");
  }

  const finishAt = new Date(game.game_definition.finish_at);
  if(now >= finishAt) {
    game.state = "completed";
  } else if(game.solution !== undefined || guesses.length === game.game_definition.guesses_allowed) {
    game.state = "player-done";
  } else {
    game.state = "running";
  }
}

const defaultGame: Game = {
  id: undefined,
  state: "disconnected",
  game_definition: {
    begin_at: undefined,
    finish_at: undefined,
    guesses_allowed: 6,
    word_length: 5,
  },
  player_id: "0",
  player_guesses: {
    "0": [],
  },
  solution: undefined,
};

export function createGameStore(socket: Socket) {
  let channel: Channel | undefined;
  let stateUpdateTimer: NodeJS.Timer | undefined;
  const { subscribe, update, set } = writable<Game>(defaultGame);

  function scheduleStateUpdate(game: Game) {
    if(game.state === "completed" && game.solution === undefined) {
      setTimeout(() => {
        channel.push("refetch_state", {})
          .receive("ok", (resp) => {
            update(prevState => ({
              ...prevState,
              player_guesses: parsePlayerGuesses(resp.player_guesses),
              solution: resp.solution,
            }));
          });
      }, 50 + Math.floor(Math.random() * 100));
    }

    if(game.state !== "waiting" && game.state !== "running" && game.state !== "player-done") {
      stateUpdateTimer = undefined;
      return;
    }
    
    const reference: string = game.state === "waiting" ? game.game_definition.begin_at : game.game_definition.finish_at;
    const refDate = new Date(reference);

    stateUpdateTimer = setTimeout(() => {
      update(game => {
        updateGameState(game);
        scheduleStateUpdate(game);
        return game;
      });
    }, refDate.getTime() - Date.now());
  }

  return {
    subscribe,
    connect: ({node, game_id, token}: GameInfo) => {
      if(channel !== undefined) {
        channel.leave();
      }
      channel = socket.channel(`game:${node}:${game_id}`, {token});
      update(state => ({...state, id: game_id, state: "connecting"}));
      return new Promise<void>((resolve, reject) => {
        channel.onClose((reason) => {
          set(defaultGame);
          channel = undefined;
          if(stateUpdateTimer) clearTimeout(stateUpdateTimer);
          if(reason !== "leave") {
            // "leave" is the reason when we purposefully disconnect
            globalAlerts.push({message: "Disconnected from game", time: 1500});
            clearLocalGameInfo();
          }
        });

        channel.onError((reason) => {
          if(reason !== undefined) {
            globalAlerts.push({message: "Connection error!", time: 5000});
          }
        });

        channel.join()
          .receive("ok", resp => {
            const game: Game = {
              ...defaultGame,
              id: game_id,
              game_definition: resp.game_definition,
              player_id: resp.player_id,
              player_guesses: parsePlayerGuesses(resp.player_guesses),
              solution: resp.solution,
            };
            updateGameState(game);

            set(game);
            scheduleStateUpdate(game);
            resolve();
          })
          .receive("error", resp => {
            globalAlerts.push({message: resp.reason, time: 1500});
            clearLocalGameInfo();
            channel.leave();
            reject();
          });
      });
    },
    guess: (guess: string) => {
      return new Promise<Classification[]>((resolve, reject) => {
        channel.push("guess_word", { word: guess })
          .receive("ok", (resp: {r: GuessMask}) => {
            const classification: Classification[] = parseGuess([guess, resp.r]);

            update(game => {
              game.player_guesses[game.player_id].push(classification);
              updateGameState(game);
              return game;
            });

            resolve(classification);
          })
          .receive("error", resp => {
            reject(resp);
          });
      });
    },
    leave: () => {
      clearLocalGameInfo();
      if(channel) {
        channel.leave();
      }
    }
  }
}