export type ActivityLogStatus = "success" | "pending" | "failed";

export type ActivityLogType =
  | "faucet"
  | "approve"
  | "deposit"
  | "mint"
  | "repay"
  | "redeem"
  | "liquidation"
  | "contract-read"
  | "system";

export type ActivityLogItem = {
  id: string;
  type: ActivityLogType;
  title: string;
  description: string;
  status: ActivityLogStatus;
  txHash?: string;
  account?: string;
  createdAt: number;
};
