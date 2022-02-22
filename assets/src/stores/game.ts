import { globalAlerts } from "$src/global";
import { clearLocalGameInfo, GameInfo } from "$src/helpers/gameInfo";
import { Classification, classifyLetter, LetterType } from "$src/helpers/letter";
import { Channel, Socket } from "phoenix";
import { writable } from "svelte/store";

type PlayerId = string | number;
export interface GameState {
  id: string | undefined;
  state: "disconnected" | "connecting" | "waiting" | "running" | "completed";
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

function parsePlayerGuesses(guesses: {[id: PlayerId]: RemoteGuess[]}): GameState["player_guesses"] {
  const result: GameState["player_guesses"] = {};
  Object.keys(guesses).forEach(playerId => {
    if(!result[playerId]) result[playerId] = [];
    guesses[playerId].reverse().forEach(guess => {
      result[playerId].push(parseGuess(guess));
    });
  });
  return result;
}

function getGameState(gameDefinition: GameState["game_definition"]): GameState["state"] {
  const now = new Date();
  const beginAt = new Date(gameDefinition.begin_at);
  const finishAt = new Date(gameDefinition.finish_at);

  if(now < beginAt) return "waiting";
  if(now < finishAt) return "running";
  return "completed";
}

const defaultState: GameState = {
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
};

export function createGameStore(socket: Socket) {
  let channel: Channel | undefined;
  let stateUpdateTimer: NodeJS.Timer | undefined;

  function scheduleStateUpdate(state: GameState["state"], definition: GameState["game_definition"]) {
    if(state !== "waiting" && state !== "running") {
      stateUpdateTimer = undefined;
      return;
    }
    
    const reference: string = state === "waiting" ? definition.begin_at : definition.finish_at;
    const refDate = new Date(reference);

    stateUpdateTimer = setTimeout(() => {
      update(prevState => ({...prevState, state: getGameState(definition)}));
      scheduleStateUpdate(getGameState(definition), definition);
    }, refDate.getTime() - Date.now());
  }

  const { subscribe, update, set } = writable<GameState>(defaultState);
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
          set(defaultState);
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
            const player_guesses = parsePlayerGuesses(resp.player_guesses);
            const gameDefinition: GameState["game_definition"] = resp.game_definition;
            const gameState = getGameState(gameDefinition);

            scheduleStateUpdate(gameState, gameDefinition);

            set({
              ...defaultState,
              id: game_id,
              state: gameState,
              game_definition: gameDefinition,
              player_id: resp.player_id,
              player_guesses,
            });
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

            update(state => {
              state.player_guesses[state.player_id].push(classification);
              return state;
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
      globalAlerts.push({message: "Left game", time: 1500});
      channel.leave();
    }
  }
}