import { ActivityLog } from "@/components/activity-log";
import { AppSidebar } from "@/components/app-sidebar";
import { ContractAddresses } from "@/components/contract-addresses";
import { DepositMint } from "@/components/deposit-mint";
import { Faucet } from "@/components/faucet";
import { HealthFactor } from "@/components/health-factor";
import { LiquidationDemo } from "@/components/liquidation-demo";
import { MyPosition } from "@/components/my-position";
import { ProtocolStatus } from "@/components/protocol-status";
import { RepayRedeem } from "@/components/repay-redeem";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />

          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>DSC Protocol Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <section className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Decentralized StableCoin Demo
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              A local DeFi protocol dashboard for collateral deposit, DSC
              minting, position monitoring, health factor tracking, and
              liquidation demonstration.
            </p>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <ProtocolStatus />
            <MyPosition />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Faucet />
            <DepositMint />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <RepayRedeem />
            <HealthFactor />
          </div>

          <LiquidationDemo />

          <div className="grid gap-6 xl:grid-cols-2">
            <ActivityLog />
            <ContractAddresses />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
