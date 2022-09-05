import { BoardProps } from "boardgame.io/react";
import { ChatMessage } from "boardgame.io";
import {
  BgioClientInfoProvider,
  BgioGProvider,
  BgioMovesProvider,
  BgioEventsProvider,
  BgioCtxProvider,
  BgioChatProvider,
} from "../bgio-contexts";
import { ScoretopiaUI } from "scoretopia-ui/ScoretopiaUI";

type MyBoardProps = BoardProps & { chatMessages?: ChatMessage[] };

export function ScoretopiaBoard(props: MyBoardProps) {
  const {
    // G
    G,
    // CTX
    ctx,
    // MOVES
    moves,
    undo,
    redo,
    // EVENTS
    events,
    reset,
    // CHAT
    sendChatMessage,
    chatMessages = [],
    // ALSO ON BOARD PROPS
    playerID,
    log,
    matchID,
    matchData,
    isActive,
    isMultiplayer,
    isConnected,
    credentials,
  } = props;
  console.log("🚀 ~ file: ScoretopiaBoard.tsx ~ line 41 ~ ScoretopiaBoard ~ props", props)
  return (
    <BgioClientInfoProvider
      log={log}
      playerID={playerID || ""}
      matchID={matchID}
      matchData={matchData}
      credentials={credentials || ""}
      isMultiplayer={isMultiplayer}
      isConnected={isConnected}
      isActive={isActive}
    >
      <BgioGProvider G={G}>
        <BgioCtxProvider ctx={ctx}>
          <BgioMovesProvider moves={moves} undo={undo} redo={redo}>
            <BgioEventsProvider reset={reset} events={events}>
              <BgioChatProvider
                chatMessages={chatMessages}
                sendChatMessage={sendChatMessage}
              >
                <ScoretopiaUI />
              </BgioChatProvider>
            </BgioEventsProvider>
          </BgioMovesProvider>
        </BgioCtxProvider>
      </BgioGProvider>
    </BgioClientInfoProvider>
  );
}
