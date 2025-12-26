import { apiRequest } from "./apiClient";

export interface GameStartRequest {
  trade: "Long" | "Short";
  position_size_fix: number;
  position_size_percent: number;
  leverage: number;
  risk: "low" | "medium" | "high";
  client_address: string;
  client_tx_hash: string;
}

export interface GameStartResponse {
  id: number;
  lang: string;
}

export interface GameFinalRequest {
  id: string;
  pnl: number;
  roi: number;
  mystery_boxes_collected: number;
  hex_data: string;
  monad_id_address: string;
}

export interface GameFinalResponse {
  client_address: string;
  client_tx_hash: string;
  final_time: string;
  id: number;
  lang: string;
  leverage: number;
  pnl: number;
  position_size_fix: number;
  position_size_percent: number;
  risk: string;
  roi: number;
  server_tx_hash: string;
  start_time: string;
  trade: string;
}

export interface MintNFTRequest {
  position_id: string;
}

export interface MintNFTResponse {
  status: string;
  tx_hash: string;
  lang: string;
}

export const gameService = {
  async startGame(payload: GameStartRequest): Promise<GameStartResponse> {
    return apiRequest<GameStartResponse>("/api/v1/game/start", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(payload),
    });
  },

  async finalizeGame(payload: GameFinalRequest): Promise<GameFinalResponse> {
    return apiRequest<GameFinalResponse>("/api/v1/game/final", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(payload),
    });
  },

  async mintNFT(payload: MintNFTRequest): Promise<MintNFTResponse> {
    return apiRequest<MintNFTResponse>("/api/v1/game/mint_nft", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(payload),
    });
  },
};
