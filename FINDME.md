# Grok The App
The main React components: App/Lobby/Client => Board => Layout => MapDisplay => MapHexes && Controls

## Disengagements/Moves
Some hexes in a move-range are considered "disengage" hexes. When these are clicked, the move is not enacted right away.
Some state is ferried through G, and a stage of taking-disengagement-swipes is triggered.
In the last disengagement swipe action is when the move is actually enacted for the unit.