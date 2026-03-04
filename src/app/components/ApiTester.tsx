"use client";

import { FormEvent, useMemo, useState } from "react";

type LogItem = {
  time: string;
  label: string;
  status?: number;
  ok: boolean;
  payload: unknown;
};

const now = () => new Date().toLocaleTimeString();

const parseJsonSafe = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return { message: "No JSON response body" };
  }
};

export default function ApiTester() {
  const [authBaseUrl, setAuthBaseUrl] = useState(process.env.NEXT_PUBLIC_AUTH_API || "http://localhost:4000");
  const [restaurantBaseUrl, setRestaurantBaseUrl] = useState(process.env.NEXT_PUBLIC_RESTAURANT_API || "http://localhost:4010");
  const [orderBaseUrl, setOrderBaseUrl] = useState(process.env.NEXT_PUBLIC_ORDER_API || "http://localhost:4020");

  const [email, setEmail] = useState("tester@example.com");
  const [password, setPassword] = useState("Passw0rd!123");
  const [fullName, setFullName] = useState("API Tester");
  const [accessToken, setAccessToken] = useState("");

  const [citySlug, setCitySlug] = useState("agadir");
  const [restaurantSlug, setRestaurantSlug] = useState("demo-restaurant");

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [busy, setBusy] = useState(false);

  const prettyToken = useMemo(() => {
    if (!accessToken) return "";
    if (accessToken.length <= 36) return accessToken;
    return `${accessToken.slice(0, 18)}...${accessToken.slice(-14)}`;
  }, [accessToken]);

  const pushLog = (item: LogItem) => {
    setLogs((prev) => [item, ...prev].slice(0, 30));
  };

  const call = async (label: string, url: string, init?: RequestInit) => {
    const res = await fetch(url, init);
    const payload = await parseJsonSafe(res);
    pushLog({
      time: now(),
      label,
      status: res.status,
      ok: res.ok,
      payload,
    });
    return { res, payload };
  };

  const healthCheck = async () => {
    setBusy(true);
    try {
      await Promise.all([
        call("Auth /health", `${authBaseUrl}/health`),
        call("Restaurant /health", `${restaurantBaseUrl}/health`),
        call("Order /v1/health", `${orderBaseUrl}/v1/health`),
      ]);
    } catch (error) {
      pushLog({
        time: now(),
        label: "Health check failed",
        ok: false,
        payload: { message: error instanceof Error ? error.message : "Unknown error" },
      });
    } finally {
      setBusy(false);
    }
  };

  const register = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await call("Auth register", `${authBaseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
    } catch (error) {
      pushLog({
        time: now(),
        label: "Auth register failed",
        ok: false,
        payload: { message: error instanceof Error ? error.message : "Unknown error" },
      });
    } finally {
      setBusy(false);
    }
  };

  const login = async () => {
    setBusy(true);
    try {
      const { payload } = await call("Auth login", `${authBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const token = (payload as { data?: { accessToken?: string } })?.data?.accessToken || "";
      if (token) setAccessToken(token);
    } catch (error) {
      pushLog({
        time: now(),
        label: "Auth login failed",
        ok: false,
        payload: { message: error instanceof Error ? error.message : "Unknown error" },
      });
    } finally {
      setBusy(false);
    }
  };

  const me = async () => {
    if (!accessToken) {
      pushLog({ time: now(), label: "Auth me", ok: false, payload: { message: "Login first" } });
      return;
    }

    setBusy(true);
    try {
      await call("Auth /auth/me", `${authBaseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      pushLog({
        time: now(),
        label: "Auth me failed",
        ok: false,
        payload: { message: error instanceof Error ? error.message : "Unknown error" },
      });
    } finally {
      setBusy(false);
    }
  };

  const listRestaurants = async () => {
    setBusy(true);
    try {
      await call("Restaurant list", `${restaurantBaseUrl}/restaurants?page=1&limit=10`);
    } catch (error) {
      pushLog({
        time: now(),
        label: "Restaurant list failed",
        ok: false,
        payload: { message: error instanceof Error ? error.message : "Unknown error" },
      });
    } finally {
      setBusy(false);
    }
  };

  const getRestaurantMenu = async () => {
    setBusy(true);
    try {
      await call(
        "Restaurant menu",
        `${restaurantBaseUrl}/restaurants/${citySlug}/${restaurantSlug}/menu?page=1&limit=20`
      );
    } catch (error) {
      pushLog({
        time: now(),
        label: "Restaurant menu failed",
        ok: false,
        payload: { message: error instanceof Error ? error.message : "Unknown error" },
      });
    } finally {
      setBusy(false);
    }
  };

  const orderHealth = async () => {
    setBusy(true);
    try {
      await call("Order /v1/ready", `${orderBaseUrl}/v1/ready`);
    } catch (error) {
      pushLog({
        time: now(),
        label: "Order ready failed",
        ok: false,
        payload: { message: error instanceof Error ? error.message : "Unknown error" },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Tasty API Test Panel</h1>

      <section className="grid gap-3 rounded border p-4">
        <h2 className="font-medium">Service URLs</h2>
        <input className="rounded border p-2" value={authBaseUrl} onChange={(e) => setAuthBaseUrl(e.target.value)} placeholder="Auth URL" />
        <input className="rounded border p-2" value={restaurantBaseUrl} onChange={(e) => setRestaurantBaseUrl(e.target.value)} placeholder="Restaurant URL" />
        <input className="rounded border p-2" value={orderBaseUrl} onChange={(e) => setOrderBaseUrl(e.target.value)} placeholder="Order URL" />
        <button className="rounded border px-3 py-2 text-sm" onClick={healthCheck} disabled={busy}>Run health checks</button>
      </section>

      <section className="grid gap-3 rounded border p-4">
        <h2 className="font-medium">Auth</h2>
        <form className="grid gap-2" onSubmit={register}>
          <input className="rounded border p-2" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          <input className="rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="rounded border p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
          <button className="rounded border px-3 py-2 text-sm" type="submit" disabled={busy}>Register</button>
        </form>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={login} disabled={busy}>Login</button>
          <button className="rounded border px-3 py-2 text-sm" onClick={me} disabled={busy}>Get /auth/me</button>
        </div>
        {prettyToken ? <p className="text-xs break-all">Token: {prettyToken}</p> : null}
      </section>

      <section className="grid gap-3 rounded border p-4">
        <h2 className="font-medium">Restaurant</h2>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={listRestaurants} disabled={busy}>List restaurants</button>
          <button className="rounded border px-3 py-2 text-sm" onClick={getRestaurantMenu} disabled={busy}>Get restaurant menu</button>
        </div>
        <input className="rounded border p-2" value={citySlug} onChange={(e) => setCitySlug(e.target.value)} placeholder="City slug" />
        <input className="rounded border p-2" value={restaurantSlug} onChange={(e) => setRestaurantSlug(e.target.value)} placeholder="Restaurant slug" />
      </section>

      <section className="grid gap-3 rounded border p-4">
        <h2 className="font-medium">Order</h2>
        <button className="rounded border px-3 py-2 text-sm" onClick={orderHealth} disabled={busy}>Check /v1/ready</button>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-3 font-medium">Logs</h2>
        <div className="space-y-3">
          {logs.length === 0 ? <p className="text-sm text-gray-500">No calls yet.</p> : null}
          {logs.map((log, index) => (
            <div key={`${log.time}-${index}`} className="rounded border p-3 text-sm">
              <p className="font-medium">
                [{log.time}] {log.label} {typeof log.status === "number" ? `(${log.status})` : ""} {log.ok ? "✅" : "❌"}
              </p>
              <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(log.payload, null, 2)}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
