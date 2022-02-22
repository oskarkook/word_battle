# Word Battle
Multiplayer word guessing game, built with:
- Elixir & Phoenix
- Svelte
- Tailwind

## Development
```
mix setup
mix phx.server
```

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

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
