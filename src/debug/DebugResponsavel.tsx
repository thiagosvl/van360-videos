import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import { ResponsavelCarteirinhaBase } from "@/pages/ResponsavelCarteirinhaBase";
import { PhoneScreen } from "../components/PhoneScreen";
import { BrandBackground } from "../components/brand";
import { VideoStateProvider } from "../mocks/videoState";
import { usarLarguraDeCelular } from "../viewport";
import { ResponsavelCarteirinhaHeader, ResponsavelCarteirinhaGeral, ResponsavelCarteirinhaCobrancas, ResponsavelCarteirinhaContrato, ResponsavelCarteirinhaAusencias } from "@/components/features/responsavel/carteirinha";
import { PermissionRescueBanner } from "@/components/common/PermissionRescueBanner";
import { carteirinhaResponsavel } from "../mocks/responsavel";
const cart: any = carteirinhaResponsavel([]);
const noop = () => {};

const telas: any[] = [
  { route: "/login", el: <Login />, path: "/login", vs: {} },
  { route: "/login?tipo=responsavel", el: <Login />, path: "/login", vs: { responsavel: { step: "phone", telefone: "(11) 98765-4321" } } },
  { route: "/login?tipo=responsavel", el: <Login />, path: "/login", vs: { responsavel: { step: "pin", telefone: "(11) 98765-4321", pin: "2468" } } },
  { route: "/responsavel/carteirinha", el: <ResponsavelCarteirinhaBase />, path: "/responsavel/carteirinha", vs: {} },
  { route: "/responsavel/carteirinha", el: <ResponsavelCarteirinhaBase />, path: "/responsavel/carteirinha", vs: { abaForcada: "parcelas" }, sc: 300 },
  { route: "/responsavel/carteirinha", el: <ResponsavelCarteirinhaBase />, path: "/responsavel/carteirinha", vs: { abaForcada: "contrato" } },
  { route: "/responsavel/carteirinha", el: <ResponsavelCarteirinhaBase />, path: "/responsavel/carteirinha", vs: { abaForcada: "ausencias" } },
  { route: "/responsavel/carteirinha", el: <ResponsavelCarteirinhaBase />, path: "/responsavel/carteirinha", vs: { abaForcada: "ausencias", responsavel: { ausencias: ["2026-03-13"] } } },
  { route: "/x", path: "/x", el: <ResponsavelCarteirinhaHeader carteirinha={cart} />, vs: {} },
  { route: "/x", path: "/x", el: <ResponsavelCarteirinhaGeral carteirinha={cart} onRefresh={noop} />, vs: {} },
  { route: "/x", path: "/x", el: <ResponsavelCarteirinhaCobrancas carteirinha={cart} />, vs: {} },
  { route: "/x", path: "/x", el: <ResponsavelCarteirinhaContrato carteirinha={cart} />, vs: {} },
  { route: "/x", path: "/x", el: <ResponsavelCarteirinhaAusencias carteirinha={cart} onRefresh={noop} />, vs: {} },
  { route: "/x", path: "/x", el: <PermissionRescueBanner type={"push" as any} role={"responsavel" as any} />, vs: {} },
];

export const DebugResponsavel: React.FC = () => {
  usarLarguraDeCelular();
  const f = useCurrentFrame();
  const t = telas[Math.min(f, telas.length - 1)];
  return (
    <BrandBackground>
      <AbsoluteFill style={{ alignItems: "center", top: 100 }}>
        <VideoStateProvider value={t.vs}>
          <PhoneScreen key={f} route={t.route} scale={2} scrollY={t.sc ?? 0} showChrome={false} contentClassName={t.route.startsWith("/login") ? "tela-cheia" : ""}>
            <Routes>
              <Route path={t.path} element={t.el} />
            </Routes>
          </PhoneScreen>
        </VideoStateProvider>
      </AbsoluteFill>
    </BrandBackground>
  );
};
