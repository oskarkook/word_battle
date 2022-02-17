import { globalAlerts } from "$src/global";
import { clearLocalGameInfo, GameInfo } from "$src/helpers/gameInfo";
import { Classification, classifyLetter, LetterType } from "$src/helpers/letter";
import { Channel, Socket } from "phoenix";
import { writable } from "svelte/store";

type PlayerId = string | number;
interface GameState {
  connected: boolean;
  game_definition: {
    begin_at: string | undefined;
    finish_at: string | undefined;
    guesses_allowed: number;
    word_length: number;
  };
  player_id: PlayerId;
  player_guesses: {
    [id: PlayerId]: LetterType[][];
  },
  my_guessed_words: Classification[][],
}

let channel: Channel | undefined;
const { subscribe, update, set } = writable<GameState>({
  connected: false,
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
  my_guessed_words: [],
});

function classifyPlayerGuesses(guesses: {[id: PlayerId]: string[]}): GameState["player_guesses"] {
  const result: GameState["player_guesses"] = {};
  Object.keys(guesses).forEach(playerId => {
    if(!result[playerId]) result[playerId] = [];
    guesses[playerId].forEach(guess => {
      const letters = guess.split("");
      result[playerId].push(letters.map(letter => classifyLetter(letter)));
    });
  });
  return result;
}

function classifyMyGuesses(guesses: string[], letterTypes: LetterType[][]): Classification[][] {
  const result: Classification[][] = [];
  guesses.forEach((guess, i) => {
    const classification: Classification[] = [];
    guess.split("").forEach((letter, j) => {
      classification.push({
        letter,
        type: letterTypes[i][j],
      });
    });
    result.push(classification);
  });
  return result;
}

export const game = {
  subscribe,
  connect: (socket: Socket, {node, game_id, token}: GameInfo) => {
    if(channel !== undefined) {
      channel.leave();
    }
    channel = socket.channel(`game:${node}:${game_id}`, {token});
    update(state => ({...state, connected: true}));
    return new Promise<void>((resolve, reject) => {
      channel.onClose((reason) => {
        update(state => ({...state, connected: false}));
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
          const player_guesses = classifyPlayerGuesses(resp.player_guesses);

          set({
            connected: true,
            game_definition: resp.game_definition,
            player_id: resp.player_id,
            player_guesses,
            my_guessed_words: classifyMyGuesses(resp.my_guessed_words, player_guesses[resp.player_id]),
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
        .receive("ok", resp => {
          const letterTypes: LetterType[] = resp.r.split("").map(letter => classifyLetter(letter));
          const classification: Classification[] = [];
          guess.split("").forEach((letter, i) => classification.push({ letter, type: letterTypes[i] }));

          update(state => {
            state.player_guesses[state.player_id].push(letterTypes);
            state.my_guessed_words.push(classification);
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
};