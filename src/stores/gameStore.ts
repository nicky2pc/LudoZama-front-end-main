import { create } from "zustand";
import type {
  GameStartResponse,
  GameFinalResponse,
} from "../services/gameService";

interface GameState {
  gameId: number | null;
  lang: string | null;
  startTime: string | null;
  trade: string | null;
  leverage: number | null;
  risk: string | null;
  positionSizeFix: number | null;
  positionSizePercent: number | null;
  clientAddress: string | null;
  clientTxHash: string | null;
  isGameActive: boolean;
  lastGamePnl: number | null;
  lastGameRoi: number | null;
  lastGameId: number | null;

  setGameData: (
    gameData: GameStartResponse,
    additionalData: {
      trade: string;
      leverage: number;
      risk: string;
      positionSizeFix: number;
      positionSizePercent: number;
      clientAddress: string;
      clientTxHash: string;
    }
  ) => void;

  clearGameData: () => void;

  setGameResult: (gameResult: GameFinalResponse) => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: JSON.parse(localStorage.getItem("game_id") || "null"),
  lang: localStorage.getItem("game_lang") || null,
  startTime: localStorage.getItem("game_start_time") || null,
  trade: localStorage.getItem("game_trade") || null,
  leverage: JSON.parse(localStorage.getItem("game_leverage") || "null"),
  risk: localStorage.getItem("game_risk") || null,
  positionSizeFix: JSON.parse(
    localStorage.getItem("game_position_size_fix") || "null"
  ),
  positionSizePercent: JSON.parse(
    localStorage.getItem("game_position_size_percent") || "null"
  ),
  clientAddress: localStorage.getItem("game_client_address") || null,
  clientTxHash: localStorage.getItem("game_client_tx_hash") || null,
  isGameActive: !!localStorage.getItem("game_id"),
  lastGamePnl: JSON.parse(localStorage.getItem("last_game_pnl") || "null"),
  lastGameRoi: JSON.parse(localStorage.getItem("last_game_roi") || "null"),
  lastGameId: JSON.parse(localStorage.getItem("last_game_id") || "null"),

  setGameData: (gameData, additionalData) => {
    const { id, lang } = gameData;
    const {
      trade,
      leverage,
      risk,
      positionSizeFix,
      positionSizePercent,
      clientAddress,
      clientTxHash,
    } = additionalData;

    localStorage.setItem("game_id", JSON.stringify(id));
    localStorage.setItem("game_lang", lang);
    localStorage.setItem("game_trade", trade);
    localStorage.setItem("game_leverage", JSON.stringify(leverage));
    localStorage.setItem("game_risk", risk);
    localStorage.setItem(
      "game_position_size_fix",
      JSON.stringify(positionSizeFix)
    );
    localStorage.setItem(
      "game_position_size_percent",
      JSON.stringify(positionSizePercent)
    );
    localStorage.setItem("game_client_address", clientAddress);
    localStorage.setItem("game_client_tx_hash", clientTxHash);

    set({
      gameId: id,
      lang,
      trade,
      leverage,
      risk,
      positionSizeFix,
      positionSizePercent,
      clientAddress,
      clientTxHash,
      isGameActive: true,
    });
  },

  clearGameData: () => {
    localStorage.removeItem("game_id");
    localStorage.removeItem("game_lang");
    localStorage.removeItem("game_start_time");
    localStorage.removeItem("game_trade");
    localStorage.removeItem("game_leverage");
    localStorage.removeItem("game_risk");
    localStorage.removeItem("game_position_size_fix");
    localStorage.removeItem("game_position_size_percent");
    localStorage.removeItem("game_client_address");
    localStorage.removeItem("game_client_tx_hash");

    set({
      gameId: null,
      lang: null,
      startTime: null,
      trade: null,
      leverage: null,
      risk: null,
      positionSizeFix: null,
      positionSizePercent: null,
      clientAddress: null,
      clientTxHash: null,
      isGameActive: false,
    });
  },

  setGameResult: (gameResult) => {
    // Store final game result if needed
    // This could be expanded based on requirements
    localStorage.setItem("game_start_time", gameResult.start_time);
    // Store the PNL value separately so it persists after clearGameData
    localStorage.setItem("last_game_pnl", JSON.stringify(gameResult.pnl));
    // Store the ROI value separately so it persists after clearGameData
    localStorage.setItem("last_game_roi", JSON.stringify(gameResult.roi));
    // Store the game ID separately so it persists after clearGameData
    localStorage.setItem("last_game_id", JSON.stringify(gameResult.id));
    set({
      startTime: gameResult.start_time,
      lastGamePnl: gameResult.pnl,
      lastGameRoi: gameResult.roi,
      lastGameId: gameResult.id,
    });
  },
}));
