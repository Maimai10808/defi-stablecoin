"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Activity,
  Boxes,
  CircleAlert,
  Coins,
  Gauge,
  Landmark,
  Layers3,
  RadioTower,
  Shield,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import * as THREE from "three";

import { useMyPosition } from "@/hooks/use-my-position";
import {
  formatDscSupply,
  formatHealthFactor,
  formatUsdValue,
  shortAddress,
} from "@/lib/format";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ProtocolSceneProps = {
  hasWallet: boolean;
  hasPosition: boolean;
  hasDebt: boolean;
  isRisky: boolean;
};

function EngineCore({ active }: { active: boolean }) {
  const coreRef = React.useRef<THREE.Mesh>(null);
  const ringRef = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.008;
      coreRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.7) * 0.12;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.012;
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          color={active ? "#dbeafe" : "#525252"}
          roughness={0.18}
          metalness={0.85}
          emissive={active ? "#2563eb" : "#111111"}
          emissiveIntensity={active ? 0.65 : 0.15}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.035, 16, 120]} />
        <meshBasicMaterial
          color={active ? "#60a5fa" : "#737373"}
          transparent
          opacity={active ? 0.85 : 0.32}
        />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.85, 0.025, 16, 120]} />
        <meshBasicMaterial
          color={active ? "#93c5fd" : "#525252"}
          transparent
          opacity={active ? 0.42 : 0.18}
        />
      </mesh>
    </group>
  );
}

function CollateralVault({ active }: { active: boolean }) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.position.y =
      -0.35 + Math.sin(state.clock.elapsedTime * 1.1) * 0.04;
  });

  return (
    <group ref={groupRef} position={[-3.1, -0.35, 0]}>
      {[-0.55, 0, 0.55].map((x, index) => (
        <mesh key={x} position={[x, index * 0.16, 0]}>
          <boxGeometry args={[0.42, 1.05 + index * 0.22, 0.42]} />
          <meshStandardMaterial
            color={active ? "#bbf7d0" : "#525252"}
            roughness={0.22}
            metalness={0.65}
            emissive={active ? "#16a34a" : "#111111"}
            emissiveIntensity={active ? 0.35 : 0.08}
          />
        </mesh>
      ))}

      <mesh position={[0, -0.68, 0]}>
        <boxGeometry args={[2.05, 0.18, 1.05]} />
        <meshStandardMaterial
          color={active ? "#86efac" : "#404040"}
          roughness={0.3}
          metalness={0.75}
        />
      </mesh>
    </group>
  );
}

function WalletSatellite({ active }: { active: boolean }) {
  const ref = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.y += 0.012;
    ref.current.position.y =
      1.15 + Math.sin(state.clock.elapsedTime * 1.4) * 0.08;
  });

  return (
    <group ref={ref} position={[-5.15, 1.15, 0]}>
      <mesh>
        <boxGeometry args={[0.85, 0.58, 0.18]} />
        <meshStandardMaterial
          color={active ? "#f8fafc" : "#525252"}
          metalness={0.7}
          roughness={0.2}
          emissive={active ? "#a855f7" : "#111111"}
          emissiveIntensity={active ? 0.35 : 0.08}
        />
      </mesh>

      <mesh position={[0.25, 0, 0.13]}>
        <circleGeometry args={[0.08, 24]} />
        <meshBasicMaterial color={active ? "#c084fc" : "#737373"} />
      </mesh>
    </group>
  );
}

function StablecoinRing({ active }: { active: boolean }) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += 0.014;
    groupRef.current.position.y =
      1.12 + Math.sin(state.clock.elapsedTime * 1.25) * 0.06;
  });

  return (
    <group ref={groupRef} position={[3.05, 1.12, 0]}>
      <mesh>
        <torusGeometry args={[0.75, 0.12, 20, 96]} />
        <meshStandardMaterial
          color={active ? "#fde68a" : "#525252"}
          roughness={0.18}
          metalness={0.8}
          emissive={active ? "#f59e0b" : "#111111"}
          emissiveIntensity={active ? 0.42 : 0.08}
        />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.38, 0.38, 0.12, 48]} />
        <meshStandardMaterial
          color={active ? "#fef3c7" : "#404040"}
          roughness={0.2}
          metalness={0.65}
        />
      </mesh>
    </group>
  );
}

function RiskShield({ active, risky }: { active: boolean; risky: boolean }) {
  const shieldRef = React.useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!shieldRef.current) return;

    shieldRef.current.rotation.z += 0.004;
    const material = shieldRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = active
      ? 0.28 + Math.sin(state.clock.elapsedTime * 2) * 0.08
      : 0.12;
  });

  return (
    <mesh ref={shieldRef} position={[4.95, -0.45, 0]} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.9, 0.04, 16, 120]} />
      <meshBasicMaterial
        color={risky ? "#fb7185" : active ? "#22c55e" : "#737373"}
        transparent
        opacity={active ? 0.32 : 0.12}
      />
    </mesh>
  );
}

type DataBeamProps = {
  start: [number, number, number];
  end: [number, number, number];
  active?: boolean;
  variant?: "green" | "blue" | "gold" | "red";
};

function DataBeam({
  start,
  end,
  active = false,
  variant = "blue",
}: DataBeamProps) {
  const ref =
    React.useRef<THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>>(
      null,
    );

  const startVec = React.useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = React.useMemo(() => new THREE.Vector3(...end), [end]);

  const midpoint = React.useMemo(
    () => startVec.clone().add(endVec).multiplyScalar(0.5),
    [startVec, endVec],
  );

  const length = React.useMemo(
    () => startVec.distanceTo(endVec),
    [startVec, endVec],
  );

  const quaternion = React.useMemo(() => {
    const direction = endVec.clone().sub(startVec).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    return new THREE.Quaternion().setFromUnitVectors(up, direction);
  }, [startVec, endVec]);

  const colorMap = {
    green: "#86efac",
    blue: "#93c5fd",
    gold: "#fde68a",
    red: "#fb7185",
  };

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.material.opacity = active
      ? 0.36 + Math.sin(state.clock.elapsedTime * 2.6) * 0.12
      : 0.12;
  });

  return (
    <mesh ref={ref} position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.026, 0.026, length, 16]} />
      <meshBasicMaterial
        transparent
        opacity={active ? 0.42 : 0.14}
        color={colorMap[variant]}
      />
    </mesh>
  );
}

function BaseGrid() {
  return (
    <group position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[2.4, 2.45, 128]} />
        <meshBasicMaterial transparent opacity={0.12} color="#ffffff" />
      </mesh>

      <mesh>
        <ringGeometry args={[4.2, 4.25, 128]} />
        <meshBasicMaterial transparent opacity={0.08} color="#ffffff" />
      </mesh>

      <mesh>
        <ringGeometry args={[5.8, 5.86, 160]} />
        <meshBasicMaterial transparent opacity={0.06} color="#ffffff" />
      </mesh>
    </group>
  );
}

function ProtocolScene({
  hasWallet,
  hasPosition,
  hasDebt,
  isRisky,
}: ProtocolSceneProps) {
  return (
    <>
      <ambientLight intensity={0.62} />
      <directionalLight position={[3, 5, 5]} intensity={1.8} />
      <pointLight position={[-5, 3, 2]} intensity={1.2} />
      <pointLight position={[4, 2, 3]} intensity={1.1} />

      <group rotation={[0.12, -0.26, 0]}>
        <BaseGrid />

        <WalletSatellite active={hasWallet} />
        <CollateralVault active={hasPosition} />
        <EngineCore active={hasPosition} />
        <StablecoinRing active={hasDebt} />
        <RiskShield active={hasPosition} risky={isRisky} />

        <DataBeam
          start={[-5.1, 1.15, 0]}
          end={[-3.1, 0.1, 0]}
          active={hasWallet}
          variant="blue"
        />

        <DataBeam
          start={[-2.2, 0.2, 0]}
          end={[-0.95, 0.2, 0]}
          active={hasPosition}
          variant="green"
        />

        <DataBeam
          start={[1.05, 0.28, 0]}
          end={[2.35, 1.05, 0]}
          active={hasDebt}
          variant="gold"
        />

        <DataBeam
          start={[0.95, 0, 0]}
          end={[4.25, -0.45, 0]}
          active={hasPosition}
          variant={isRisky ? "red" : "green"}
        />
      </group>
    </>
  );
}

type MetricBlockProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
};

function MetricBlock({ icon, label, value, description }: MetricBlockProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>

      <p className="text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

type FlowItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function FlowItem({ icon, title, description }: FlowItemProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg border bg-background">
          {icon}
        </div>
        <p className="text-sm font-medium">{title}</p>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function getRiskLabel(healthFactor?: bigint) {
  if (healthFactor === undefined) return "Loading";

  const value = Number(healthFactor) / 1e18;

  if (value >= 2) return "Protected";
  if (value >= 1.2) return "Watch";
  if (value >= 1) return "High Risk";

  return "Liquidatable";
}

function isRiskyHealthFactor(healthFactor?: bigint) {
  if (healthFactor === undefined) return false;

  const value = Number(healthFactor) / 1e18;

  return value < 1.2;
}

export function Protocol3DOverview() {
  const { wallet, position, status } = useMyPosition();

  const hasCollateral =
    position.collateralValueInUsd !== undefined &&
    position.collateralValueInUsd > BigInt(0);

  const hasDebt =
    position.totalDscMinted !== undefined &&
    position.totalDscMinted > BigInt(0);

  const hasPosition = hasCollateral || hasDebt;
  const isRisky = isRiskyHealthFactor(position.healthFactor);

  return (
    <Card id="protocol-3d-overview" className="scroll-mt-20 overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="size-5" />
              Protocol 3D Overview
            </CardTitle>

            <CardDescription>
              A cinematic DeFi risk engine view for collateral, DSC minting, and
              liquidation safety.
            </CardDescription>
          </div>

          <Badge
            variant={wallet.isConnected ? "default" : "secondary"}
            className="gap-1"
          >
            {wallet.isConnected ? (
              <ShieldCheck className="size-3" />
            ) : (
              <CircleAlert className="size-3" />
            )}
            {wallet.isConnected ? "Wallet Connected" : "Connect Wallet"}
          </Badge>
        </div>

        {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Failed to read protocol position data. Please check whether Anvil is
            running, contracts are deployed, and your wallet is connected.
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-2xl border bg-background">
            <div className="flex flex-col gap-3 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  DSC Collateral Risk Engine
                </p>
                <p className="text-xs text-muted-foreground">
                  Wallet → Collateral Vault → DSCEngine Core → DSC Mint Layer →
                  Risk Shield
                </p>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline">
                  {hasPosition ? "Position Active" : "No Position"}
                </Badge>
                <Badge variant={isRisky ? "secondary" : "default"}>
                  {getRiskLabel(position.healthFactor)}
                </Badge>
              </div>
            </div>

            <div className="relative h-[460px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_38%),radial-gradient(circle_at_20%_25%,rgba(34,197,94,0.12),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.12),transparent_32%)]">
              <Canvas camera={{ position: [0, 2.45, 7.6], fov: 44 }}>
                <ProtocolScene
                  hasWallet={wallet.hasWallet}
                  hasPosition={hasPosition}
                  hasDebt={hasDebt}
                  isRisky={isRisky}
                />
              </Canvas>

              <div className="pointer-events-none absolute left-4 top-4 rounded-xl border bg-background/70 px-3 py-2 text-xs backdrop-blur">
                <p className="font-medium">Live On-chain State</p>
                <p className="mt-1 text-muted-foreground">
                  Rendered from generated wagmi hooks
                </p>
              </div>

              <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl border bg-background/70 px-3 py-2 text-xs backdrop-blur">
                <p className="font-medium">Risk Shield</p>
                <p className="mt-1 text-muted-foreground">
                  Health Factor: {formatHealthFactor(position.healthFactor)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <MetricBlock
              icon={<Wallet className="size-3.5" />}
              label="Connected Account"
              value={shortAddress(wallet.address)}
              description="The wallet currently interacting with the local DSC protocol."
            />

            <MetricBlock
              icon={<Landmark className="size-3.5" />}
              label="Collateral Value"
              value={formatUsdValue(position.collateralValueInUsd)}
              description="Total deposited collateral value calculated by DSCEngine."
            />

            <MetricBlock
              icon={<Coins className="size-3.5" />}
              label="Minted DSC"
              value={formatDscSupply(position.totalDscMinted)}
              description="Stablecoin debt minted against the collateral position."
            />

            <MetricBlock
              icon={<Gauge className="size-3.5" />}
              label="Health Factor"
              value={formatHealthFactor(position.healthFactor)}
              description="Core liquidation safety indicator of the account."
            />
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 md:grid-cols-4">
          <FlowItem
            icon={<Wallet className="size-4" />}
            title="1. Wallet Access"
            description="The user connects a wallet and receives local WETH or WBTC mock collateral from the faucet."
          />

          <FlowItem
            icon={<Layers3 className="size-4" />}
            title="2. Collateral Vault"
            description="Collateral enters DSCEngine and becomes the backing asset for future DSC minting."
          />

          <FlowItem
            icon={<RadioTower className="size-4" />}
            title="3. Price Oracle Layer"
            description="Collateral value is interpreted through price feed logic, forming the USD basis of the position."
          />

          <FlowItem
            icon={<Shield className="size-4" />}
            title="4. Risk Shield"
            description="Health Factor continuously determines whether the position is safe, risky, or liquidatable."
          />
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          <Activity className="mt-0.5 size-4 shrink-0" />
          <p>
            This 3D panel is not a random visual effect. It maps the actual DSC
            protocol lifecycle: wallet access, collateral deposit, price-based
            valuation, stablecoin minting, and health-factor risk monitoring.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
