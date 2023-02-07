# Notes on the files / structure
Keeping the directory structure flat makes it so that no changes must be made to scripts, but climb that hill anytime!
- game > rollInitiative 
- setup > (mapGen &  hexGen & unitGen)
- moves get called in the UI, but run on the game server (local, or remote) too
- constants is kinda utilities too
- selectors are meant to just operate on G mostly, but I didn't really Type them that way... lesson learned
