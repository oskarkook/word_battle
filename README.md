# Word Battle
Multiplayer word guessing game, built with:
- Elixir & Phoenix
- Svelte
- Tailwind

## Development
The back-end requires word lists for valid guesses and solutions. By default, these are loaded from
`./words/valid_guesses.txt` and `./words/solutions.txt`. These files are not provided with the
repository, so you should create your word lists there. Each word must be on its own line:
```
weary
pilot
pills
blush
focal
```

After creating the word files, run the following:
```
mix setup
mix phx.server
```

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

### Deployment
For deployment, Mix releases and Docker are used. The [`Dockerfile`](./Dockerfile) handles this
automatically:
```
docker build .
```

During the Docker build, word lists are automatically copied from `./words/solutions.txt` and
`./words/valid_guesses.txt` and bundled into the image. This allows for an easier deployment without
any static storage requirements.

## Environment variables
- `SOLUTIONS` - Required. Path to the file with solution words
- `VALID_GUESSES` - Required. Path to the file with valid guess words
- `WORD_LENGTH` - Optional, defaults to `5`. Any words that are not this length will be discarded.

## Back-end architecture
The lifecycle of a player is as follows:
1. The user joins the `player:lobby` channel
2. Through that channel, the user joins the queue on a node
3. Once the queue fills, a game is created
4. The user receives a token that authenticates them for that game
5. The user joins the channel for that game

### Process tree
On the server, the process lifecycle for queueing looks roughly like this:

![
graph TD
    PlayerChannel -->|Joins queue| PlayerQueue
    PlayerQueue -->|Waits for queue to fill<br>and then creates game| GameState
    GameState -->|Notifies that game<br>has been created| PlayerChannel
](https://mermaid.ink/img/pako:eNpVkL1uAyEMgF_F8py8wKnK0lSVOlStUqkLi3OYgMRPAmaIcnn3-i5p1DIgbD5_NlxwLJZxwEOlo4evrcmg6yPSmeuzp5w5wnq9md5KyA1OnTtP9-vPOfjLL4mF_qYgDVyptwqQAi7E-LSvG8oWxHOGsTIJNzhQUuWr7jvRxE34CBfde5HggrLiSZaC2eSpwZ4fJjv9H9tkk3GFiWuiYPWJl1ltUJsnNjjo0bKjHsWgyVdF-9Gq58UGKRUHR7HxCqlL2Z3ziIPUzr_QNpD-WLpT1x-DeHI2)
