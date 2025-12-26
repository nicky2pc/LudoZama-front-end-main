import { apiRequest } from "./apiClient";

export interface HistoryTransaction {
  client_address: string;
  client_tx_hash: string;
  final_time: string;
  id: string;
  lang: string;
  leverage: string;
  pnl: string;
  position_size_fix: string;
  position_size_percent: string;
  risk: string;
  roi: string;
  server_tx_hash: string | null;
  start_time: string;
  trade: string;
}

export type HistoryResponse = HistoryTransaction[];

export const transactionService = {
  async getTrans(): Promise<HistoryResponse> {
    return apiRequest<HistoryResponse>("/api/v1/history/positions", {
      method: "GET",
      authenticated: true,
    });
  },
};
