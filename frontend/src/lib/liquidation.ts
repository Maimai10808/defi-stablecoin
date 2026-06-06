export function getLiquidationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("HealthFactorIsSafe")) {
    return "Target position is healthy and cannot be liquidated.";
  }

  if (message.includes("HealthFactorNotImproved")) {
    return "Liquidation did not improve the target health factor. Try increasing the debt to cover.";
  }

  if (
    message.includes("TransferFromFailed") ||
    message.includes("InsufficientAllowance") ||
    message.toLowerCase().includes("allowance")
  ) {
    return "Please approve enough DSC before liquidation.";
  }

  if (message.toLowerCase().includes("nonce too low")) {
    return "Local wallet nonce is out of sync. Reset wallet activity/nonce data or restart Anvil.";
  }

  return "Liquidation failed. Please check target health factor, DSC allowance, and debt to cover.";
}

export function getDscApprovalErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.toLowerCase().includes("nonce too low")) {
    return "Local wallet nonce is out of sync. Reset wallet activity/nonce data or restart Anvil.";
  }

  return "DSC approval failed. Check the connected wallet and try again.";
}
