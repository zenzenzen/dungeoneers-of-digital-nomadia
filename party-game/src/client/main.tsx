import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { io, type Socket } from "socket.io-client";
import type {
  Ack,
  CardDefinition,
  CardInstance,
  Command,
  ContentBundle,
  Currency,
  Snapshot,
  SourceAsset,
  Wallet,
} from "../shared/types";
import { currencies } from "../shared/types";
import { GameCard, CardArt } from "./Card";
import {
  emptyCollection,
  loadCollection,
  mergeCollection,
  parseCollection,
  saveCollection,
  type Collection,
} from "./collection";
import "./styles.css";

interface Credentials {
  code: string;
  token: string;
  playerId: string;
  contentVersion: string;
}
type Screen = "play" | "collection" | "rules" | "archive";
const labels: Record<Currency, string> = {
  cash_cp: "Cash",
  btc: "BTC",
  exposure: "Exposure",
  therapy_healedness: "Therapy",
  social_capital: "Social capital",
  temp_chill: "Temporary Chill",
};
const amount = (n: number, c: Currency) =>
  c === "btc" ? (n / 100_000_000).toFixed(8) : n.toLocaleString();
const phaseNames = {
  lobby: "The pregame",
  prepare: "Make your move",
  negotiate: "Find an accomplice",
  intervene: "Help. Hurt. Or hold.",
  cleanup: "Take your winnings",
  finished: "The morning after",
};
function loadSeat(): Credentials | null {
  try {
    const c = JSON.parse(localStorage.getItem("nomadia.seat") ?? "null");
    return c && /^[A-Z2-9]{6}$/.test(c.code) && /^[a-f0-9]{64}$/.test(c.token)
      ? c
      : null;
  } catch {
    return null;
  }
}
function App() {
  const [bundle, setBundle] = useState<ContentBundle | null>(null),
    [screen, setScreen] = useState<Screen>("play");
  const [credentials, setCredentials] = useState<Credentials | null>(loadSeat),
    [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [connected, setConnected] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [collection, setCollection] = useState<Collection>(loadCollection),
    [now, setNow] = useState(Date.now());
  const socket = useRef<Socket | null>(null),
    current = useRef<Snapshot | null>(null),
    clockOffset = useRef(0);
  useEffect(() => {
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error("The game server is unavailable.");
        return r.json();
      })
      .then(setBundle)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + clockOffset.current), 500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!credentials) return;
    const s = io({
      auth: { code: credentials.code, token: credentials.token },
      reconnection: true,
    });
    socket.current = s;
    s.on("connect", () => {
      setConnected(true);
      setError("");
    });
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", (e) => setError(e.message));
    s.on("removed", () => {
      setCredentials(null);
      setSnapshot(null);
      localStorage.removeItem("nomadia.seat");
      setError("The host removed your lobby seat.");
    });
    s.on("snapshot", (view: Snapshot) => {
      current.current = view;
      clockOffset.current = view.serverTime - Date.now();
      setNow(view.serverTime);
      setSnapshot(view);
      setCollection((previous) => {
        const self = view.players.find((p) => p.id === view.selfId);
        const next = mergeCollection(previous, {
          schemaVersion: 1,
          cards: view.discoveries,
          endings:
            view.phase === "finished" && self?.ending
              ? [
                  {
                    id: `${view.id}:${view.run}:${self.id}`,
                    text: self.ending,
                    won: view.winnerId === self.id,
                  },
                ]
              : [],
        });
        try {
          saveCollection(next);
        } catch {
          setNotice(
            "Browser storage is full. Export your collection to keep it.",
          );
        }
        return next;
      });
    });
    return () => {
      s.disconnect();
      socket.current = null;
      setConnected(false);
    };
  }, [credentials?.code, credentials?.token]);
  useEffect(() => {
    if (snapshot && bundle?.version !== snapshot.contentVersion)
      fetch(`/api/content?version=${snapshot.contentVersion}`)
        .then((r) => {
          if (!r.ok) throw new Error("This room’s rules could not be loaded.");
          return r.json();
        })
        .then(setBundle)
        .catch((e) => setError(e.message));
  }, [snapshot?.contentVersion, bundle?.version]);
  async function send(command: Command) {
    if (!socket.current?.connected || !current.current || busy) return;
    setBusy(true);
    setError("");
    const commandId = crypto.randomUUID();
    try {
      let ack: Ack = { ok: false };
      for (let attempt = 0; attempt < 2; attempt++) {
        ack = await socket.current.timeout(6000).emitWithAck("command", {
          commandId,
          expectedRevision: current.current.revision,
          command,
        });
        if (ack.code !== "STALE_REVISION") break;
      }
      if (!ack.ok) setError(ack.message ?? "That action is unavailable.");
    } catch {
      setError(
        "No confirmation yet. Reconnecting will restore the saved table.",
      );
      socket.current?.emit("sync");
    } finally {
      setBusy(false);
    }
  }
  async function enter(nickname: string, code?: string) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(
        code ? `/api/rooms/${encodeURIComponent(code)}/join` : "/api/rooms",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname }),
        },
      );
      const result = await r.json();
      if (!r.ok) throw new Error(result.error ?? "Unable to join.");
      localStorage.setItem("nomadia.seat", JSON.stringify(result));
      setCredentials(result);
      setScreen("play");
      history.replaceState(null, "", `?room=${result.code}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function leave() {
    socket.current?.disconnect();
    current.current = null;
    setCredentials(null);
    setSnapshot(null);
    localStorage.removeItem("nomadia.seat");
    history.replaceState(null, "", "/");
  }
  async function share() {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(
        `${location.origin}/?room=${credentials.code}`,
      );
      setNotice("Invite link copied. Bring questionable friends.");
    } catch {
      setNotice(`Share room code ${credentials.code}.`);
    }
  }
  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const validBundle =
    bundle && (!snapshot || snapshot.contentVersion === bundle.version);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setScreen("play");
          }}
        >
          <span className="brand-mark">
            d<span>n</span>
          </span>
          <span>
            DIGITAL
            <br />
            NOMADIA
            <span className="brand-small">BAD DECISIONS. GOOD COMPANY.</span>
          </span>
        </a>
        <div className="nav-label">YOUR EVENING</div>
        <nav aria-label="Main navigation">
          {(
            [
              ["play", "↗", "Play"],
              ["collection", "▧", "Your collection"],
              ["rules", "?", "How to play"],
              ["archive", "⌕", "Source archive"],
            ] as const
          ).map(([key, icon, label]) => (
            <button
              key={key}
              aria-current={screen === key ? "page" : undefined}
              onClick={() => setScreen(key)}
            >
              <span>{icon}</span>
              {label}
              {key === "collection" && <small>{collection.cards.length}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-campaign">
          <span className="tiny-label">ON THE TABLE</span>
          <strong>
            Swipe Right,
            <br />
            Regret Later
          </strong>
          <p>Dating mixer · Campaign 01</p>
          <span className="pill">
            <i /> Ready to mingle
          </span>
        </div>
        <div className="sidebar-bottom">
          <span>1+ questionable decisions</span>
          <span>25–40 minute target · Ages 18+</span>
          <span>Fictional romance. Real sabotage.</span>
          <b>
            EARLY PLAYTEST EDITION <span>01</span>
          </b>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            <span className="status-dot" />
            {credentials
              ? connected
                ? "TABLE CONNECTED"
                : "RECONNECTING"
              : "PRIVATE PARTY GAME"}
          </span>
          <div>
            {credentials && (
              <button className="text-button" onClick={share}>
                Room <b>{credentials.code}</b> ↗
              </button>
            )}
            <button
              className="round-button"
              aria-label="Quick rules"
              onClick={() => setHelpOpen(true)}
            >
              ?
            </button>
          </div>
        </header>
        <main>
          {error && (
            <div role="alert" className="banner error">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="banner">
              {notice}
              <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
                ×
              </button>
            </div>
          )}
          {!validBundle ? (
            <div className="loading">Setting the table…</div>
          ) : screen === "rules" ? (
            <Rules />
          ) : screen === "collection" ? (
            <CollectionScreen
              bundle={bundle}
              collection={collection}
              onChange={(c) => {
                setCollection(c);
                saveCollection(c);
              }}
              onError={setError}
            />
          ) : screen === "archive" ? (
            <Archive />
          ) : credentials ? (
            snapshot ? (
              <>
                {!connected && (
                  <div role="status" className="banner">
                    Connection lost. Your seat is saved; reconnecting
                    automatically.
                  </div>
                )}
                {snapshot.phase === "lobby" ? (
                  <Lobby
                    snapshot={snapshot}
                    bundle={bundle}
                    send={send}
                    busy={busy || !connected}
                    share={share}
                  />
                ) : (
                  <Table
                    snapshot={snapshot}
                    bundle={bundle}
                    send={send}
                    busy={busy || !connected}
                    now={now}
                  />
                )}
                <button className="leave-table" onClick={leave}>
                  Leave this table
                </button>
              </>
            ) : (
              <div className="loading">
                Reclaiming your seat…
                <button className="text-button" onClick={leave}>
                  Join a different room
                </button>
              </div>
            )
          ) : (
            <Home bundle={bundle} enter={enter} busy={busy} />
          )}
        </main>
        <footer>
          Digital Nomadia <span>Keep the joke. Play the card.</span>
          <span>v0.1 / Fictional adults, fictional stakes.</span>
        </footer>
      </div>
      {helpOpen && (
        <div className="modal-backdrop" onClick={() => setHelpOpen(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Quick rules"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close rules"
              onClick={() => setHelpOpen(false)}
            >
              ×
            </button>
            <Rules />
          </section>
        </div>
      )}
    </div>
  );
}

function Home({
  bundle,
  enter,
  busy,
}: {
  bundle: ContentBundle;
  enter: (nickname: string, code?: string) => void;
  busy: boolean;
}) {
  const query = new URLSearchParams(location.search).get("room") ?? "";
  const [mode, setMode] = useState<"create" | "join">(
      query ? "join" : "create",
    ),
    [nickname, setNickname] = useState(""),
    [code, setCode] = useState(query);
  const ghost = bundle.cards.find((c) => c.name === "The Ghoster")!,
    trait = bundle.cards.find((c) => c.name === "Chronic Oversharer")!;
  return (
    <>
      <div className="campaign-heading">
        <span className="eyebrow">CAMPAIGN 01 / THE DATING MIXER</span>
        <span className="edition">A SOCIAL DISASTER, DEALT FRESH.</span>
      </div>
      <section className="home-grid">
        <div className="home-story">
          <h1>
            Swipe Right.
            <br />
            <em>Regret Later.</em>
          </h1>
          <p className="intro">
            Find romance. Lose your Chill.
            <br />
            Ask your worst friend for help.
          </p>
          <div className="hero-cards" aria-label="Example cards">
            <div className="hero-card-back">
              <GameCard card={trait} />
            </div>
            <div className="hero-card-front">
              <GameCard card={ghost} />
            </div>
            <span className="hero-note">
              Your type?
              <br />
              <svg viewBox="0 0 80 40">
                <path
                  d="M70 5Q60 40 12 25m0 0 12-8M12 25l15 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </div>
        </div>
        <div className="home-start">
          <div className="ticket-top">
            <span>ADMIT YOUR ENTIRE GROUP CHAT</span>
            <span>↗</span>
          </div>
          <h2>
            Make it
            <br />
            everyone’s problem.
          </h2>
          <p>
            A private room. A random personality.
            <br />
            Absolutely no game master required.
          </p>
          <div className="segmented" aria-label="Room options">
            <button
              className={mode === "create" ? "selected" : ""}
              onClick={() => setMode("create")}
            >
              Host a game
            </button>
            <button
              className={mode === "join" ? "selected" : ""}
              onClick={() => setMode("join")}
            >
              Join friends
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enter(nickname, mode === "join" ? code.toUpperCase() : undefined);
            }}
          >
            <label>
              Your nickname
              <input
                name="nickname"
                autoComplete="nickname"
                maxLength={24}
                required
                value={nickname}
                placeholder="A name you can live with"
                onChange={(e) => setNickname(e.target.value)}
              />
            </label>
            {mode === "join" && (
              <label>
                Room code
                <input
                  name="code"
                  autoComplete="off"
                  maxLength={6}
                  minLength={6}
                  required
                  value={code}
                  placeholder="ABC234"
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </label>
            )}
            <button className="primary big" disabled={busy || !nickname.trim()}>
              {busy
                ? "Setting the table…"
                : mode === "create"
                  ? "Create a room ↗"
                  : "Join room ↗"}
            </button>
          </form>
          <div className="ticket-facts">
            <span>
              <b>1+</b> players
            </span>
            <span>
              <b>25–40</b> min target
            </span>
            <span>
              <b>0</b> signups
            </span>
          </div>
          <p className="small-note">
            Your collection stays in this browser. Your dignity is your
            responsibility.
          </p>
        </div>
      </section>
      <section className="loop-strip" aria-label="Game loop">
        <span className="tiny-label">HOW YOUR NIGHT GOES</span>
        {[
          ["01", "Draw a red flag"],
          ["02", "Beg. Bargain. Betray."],
          ["03", "Level up to romance"],
        ].map(([n, t]) => (
          <div key={n}>
            <span>{n}</span>
            <strong>{t}</strong>
          </div>
        ))}
      </section>
      <div className="coming-next">
        <span>NEXT ON THE ITINERARY</span>
        <p>
          CryptoCon <small>Find an investor</small>
        </p>
        <p>
          Tropical Coworking <small>Find a normal life</small>
        </p>
        <span>Future campaigns</span>
      </div>
    </>
  );
}

function Lobby({
  snapshot: s,
  bundle,
  send,
  busy,
  share,
}: {
  snapshot: Snapshot;
  bundle: ContentBundle;
  send: (c: Command) => void;
  busy: boolean;
  share: () => void;
}) {
  const host = s.hostId === s.selfId;
  const all = s.players.every((p) => p.connected);
  return (
    <section className="lobby">
      <span className="eyebrow">THE PRE-GAME / PRIVATE ROOM</span>
      <h1>
        Gather your
        <br />
        <em>bad influences.</em>
      </h1>
      <div className="lobby-grid">
        <div>
          <div className="invite-code">
            <span>ROOM CODE</span>
            <strong>{s.code}</strong>
            <button className="secondary" onClick={share}>
              Copy invite link ↗
            </button>
          </div>
          <div className="seat-list">
            {s.players.map((p, i) => (
              <div className="seat-row" key={p.id}>
                <span className={`avatar color-${i}`}>{p.name[0]}</span>
                <strong>
                  {p.name}
                  {p.id === s.selfId ? " (you)" : ""}
                </strong>
                <span>{p.connected ? "Connected" : "Reconnecting"}</span>
                {p.id === s.hostId ? (
                  <small>HOST</small>
                ) : (
                  host && (
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => send({ type: "kick", playerId: p.id })}
                      aria-label={`Remove ${p.name}`}
                    >
                      Remove
                    </button>
                  )
                )}
              </div>
            ))}
            {Array.from(
              {
                length: Math.max(
                  0,
                  bundle.campaign.rules.minPlayers - s.players.length,
                ),
              },
              (_, i) => (
                <div className="empty-seat" key={i}>
                  ＋ Waiting for a questionable friend
                </div>
              ),
            )}
          </div>
          {host ? (
            <button
              className="primary big"
              disabled={
                busy ||
                s.players.length < bundle.campaign.rules.minPlayers ||
                !all
              }
              onClick={() => send({ type: "start" })}
            >
              Deal everyone a personality ↗
            </button>
          ) : (
            <div className="banner">Waiting for the host to start.</div>
          )}
          <p className="small-note">
            {s.players.length} {s.players.length === 1 ? "player" : "players"}{" "}
            seated.
            {bundle.campaign.rules.maxPlayers !== null &&
              ` Capacity: ${bundle.campaign.rules.maxPlayers}.`}
            {bundle.campaign.rules.minPlayers === 1
              ? " Start solo or invite more friends. Everyone seated must be connected."
              : ` At least ${bundle.campaign.rules.minPlayers} connected players to begin.`}
          </p>
        </div>
        <div className="lobby-rules">
          <span className="tiny-label">BEFORE ANYONE GETS ATTACHED</span>
          <h2>
            You are not
            <br />
            your profile.
          </h2>
          <p>
            Get one random class, two traits, a piece of gear, and three action
            cards. Your bonuses depend on the encounter.
          </p>
          <ol>
            <li>Beat monsters to reach level 5.</li>
            <li>Offer loot to a friend who helps.</li>
            <li>Everyone gets one chance to intervene.</li>
            <li>Beat a finale. Achieve fictional romance.</li>
          </ol>
          <p>
            Zero Chill? You’re Triggered, not eliminated. You recover on your
            next turn.
          </p>
          <div className="mini-rule">
            No permanent power. Fresh mistakes every run.
          </div>
        </div>
      </div>
    </section>
  );
}

function Table({
  snapshot: s,
  bundle,
  send,
  busy,
  now,
}: {
  snapshot: Snapshot;
  bundle: ContentBundle;
  send: (c: Command) => void;
  busy: boolean;
  now: number;
}) {
  const defs = Object.fromEntries(bundle.cards.map((c) => [c.id, c]));
  const me = s.players.find((p) => p.id === s.selfId)!,
    lead = s.players[s.turnIndex];
  const own = lead.id === s.selfId;
  const can = (type: string) => s.legalActions.includes(type) && !busy;
  const encounter = s.encounter ? defs[s.encounter.card.cardId] : null;
  const [selected, setSelected] = useState<CardDefinition | null>(null),
    [replaceGear, setReplaceGear] = useState("");
  const [helper, setHelper] = useState(""),
    [currency, setCurrency] = useState<Currency>("cash_cp"),
    [payment, setPayment] = useState(0),
    [loot, setLoot] = useState(0);
  const [showBoard, setShowBoard] = useState(false),
    [buildExpanded, setBuildExpanded] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const remaining =
    s.deadline === null
      ? null
      : Math.max(0, Math.ceil((s.deadline - now) / 1000));
  useEffect(() => {
    setHelper("");
    setPayment(0);
    setLoot(0);
  }, [s.encounter?.card.instanceId]);
  const detail = (c: CardInstance) => (
    <button
      className="mini-card"
      key={c.instanceId}
      onClick={() => setSelected(defs[c.cardId])}
    >
      <span>{defs[c.cardId].kind}</span>
      <strong>{defs[c.cardId].name}</strong>
      <small>{defs[c.cardId].rules}</small>
    </button>
  );
  if (s.phase === "finished")
    return (
      <section className="results">
        <span className="eyebrow">THE MORNING AFTER / RUN {s.run}</span>
        <h1>
          {s.winnerId ? "It’s official." : "Well, that"}
          <br />
          <em>
            {s.winnerId ? "Someone connected." : "was character building."}
          </em>
        </h1>
        <p className="intro">
          {s.winnerId
            ? `${s.players.find((p) => p.id === s.winnerId)!.name} found romance.`
            : "No romance winner this time. Eight rounds, plenty of lore."}
        </p>
        <div className="ending-list">
          {s.players.map((p) => (
            <article key={p.id} className={p.id === s.winnerId ? "winner" : ""}>
              <span>
                {p.id === s.winnerId
                  ? "♥ THE HAPPY ENDING"
                  : `LEVEL ${p.level} / ${p.chill} CHILL`}
              </span>
              <h3>{p.name}</h3>
              <p>{p.ending}</p>
            </article>
          ))}
        </div>
        {can("rematch") ? (
          <button className="primary" onClick={() => send({ type: "rematch" })}>
            Same friends. New red flags. ↗
          </button>
        ) : (
          <p>Waiting for the host to open a rematch.</p>
        )}
        <p className="small-note">
          Discovered cards and your ending were saved to your local collection.
          Builds and currencies reset next run.
        </p>
      </section>
    );
  return (
    <section
      className="table"
      data-phase={s.phase}
      data-active={lead.id}
      data-self={s.selfId}
      data-revision={s.revision}
    >
      <div className="table-heading">
        <div>
          <span className="eyebrow">
            ROUND {s.round} / 8 · {bundle.campaign.title}
          </span>
          <h1>{phaseNames[s.phase]}</h1>
        </div>
        <div
          className={`turn-clock ${remaining !== null && remaining < 10 ? "urgent" : ""}`}
        >
          <span>
            {s.paused
              ? "PAUSED"
              : own
                ? "YOUR TURN"
                : `${lead.name.toUpperCase()}’S TURN`}
          </span>
          <strong>
            {s.paused ? "Ⅱ" : remaining === null ? "—" : `${remaining}s`}
          </strong>
        </div>
      </div>
      {s.paused && (
        <div className="banner" role="status">
          Table paused. {Math.min(2, s.players.length)}{" "}
          {s.players.length === 1 ? "player must" : "players must"} reconnect;
          your remaining time is preserved.
        </div>
      )}
      <div className="player-strip" aria-label="Players">
        {s.players.map((p, i) => (
          <button
            key={p.id}
            className={`player-chip ${p.id === lead.id ? "active-player" : ""} ${p.id === s.selfId ? "self-player" : ""}`}
            onClick={() =>
              setSelected(p.classCard ? defs[p.classCard.cardId] : null)
            }
          >
            <span className={`avatar color-${i}`}>{p.name[0]}</span>
            <span>
              <strong>
                {p.name}
                {p.id === s.selfId ? " · you" : ""}
              </strong>
              <small>
                LV {p.level} <b>·</b>{" "}
                {p.triggered
                  ? "TRIGGERED"
                  : `${p.chill}/${bundle.campaign.rules.maxChill} Chill`}
                {!p.connected ? " · offline" : ""}
              </small>
            </span>
            <span className="hand-count" title="Action cards">
              ▧ {p.handCount}
            </span>
          </button>
        ))}
      </div>
      <div className="table-grid">
        <div className="encounter-zone">
          {s.phase === "prepare" ? (
            <div className="draw-zone">
              <span className="tiny-label">
                {own
                  ? "THE NIGHT IS YOUNG. YOUR CHILL IS FINITE."
                  : `${lead.name.toUpperCase()} IS GETTING READY.`}
              </span>
              <div className="deck-illustration">
                <div />
                <div />
                <div>
                  <span>dn</span>
                  <CardArt kind="monster" />
                  <strong>
                    EXPECT NOTHING.
                    <br />
                    BE DISAPPOINTED ANYWAY.
                  </strong>
                </div>
              </div>
              <h2>
                {own ? "What could go wrong?" : "Watch the plot thicken."}
              </h2>
              <p>Reveal an encounter. Or take a little time for yourself.</p>
              {own && (
                <div className="button-row">
                  <button
                    className="primary"
                    disabled={!can("reveal")}
                    onClick={() => send({ type: "reveal" })}
                  >
                    Reveal encounter ↗
                  </button>
                  <button
                    className="secondary"
                    disabled={!can("self_care")}
                    onClick={() => send({ type: "self_care" })}
                  >
                    Self-care (+{bundle.campaign.rules.selfCareHeal} Chill)
                  </button>
                </div>
              )}
              {can("finale") && (
                <div className="finale-choices">
                  <strong>Level 5. Make it official.</strong>
                  {bundle.campaign.pools.finale.map((id) => (
                    <button
                      className="secondary"
                      key={id}
                      onClick={() => send({ type: "finale", cardId: id })}
                    >
                      {defs[id].name} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : encounter ? (
            <div className="encounter-layout">
              <GameCard card={encounter} />
              <div className="combat-panel">
                <span className="tiny-label">
                  {encounter.kind === "event"
                    ? "A LITTLE PLOT TWIST"
                    : "THE VIBE CHECK"}
                </span>
                {encounter.kind !== "event" && s.combat && (
                  <>
                    <div className="combat-score">
                      <div>
                        <span>YOUR SIDE</span>
                        <strong>{s.combat.party}</strong>
                      </div>
                      <span>vs</span>
                      <div>
                        <span>ENCOUNTER</span>
                        <strong>{s.combat.encounter}</strong>
                      </div>
                    </div>
                    <p
                      className={`combat-verdict ${s.combat.party > s.combat.encounter ? "winning" : "losing"}`}
                    >
                      {s.combat.party > s.combat.encounter
                        ? "Currently winning. Do not get comfortable."
                        : "Currently losing. Ties favor the encounter."}
                    </p>
                    <details className="modifier-details" open>
                      <summary>Why these numbers?</summary>
                      {Object.entries(s.combat.modifiers).map(([id, mods]) => (
                        <div key={id}>
                          <strong>
                            {s.players.find((p) => p.id === id)?.name}
                          </strong>
                          {mods.map((m, i) => (
                            <p key={i}>
                              <span>{m.source}</span>
                              <b>
                                {m.amount >= 0 ? "+" : ""}
                                {m.amount}
                              </b>
                            </p>
                          ))}
                        </div>
                      ))}
                      {s.encounter!.adjustments.map((m, i) => (
                        <p key={i}>
                          <span>
                            {m.source} → {m.side}
                          </span>
                          <b>
                            {m.amount >= 0 ? "+" : ""}
                            {m.amount}
                          </b>
                        </p>
                      ))}
                    </details>
                  </>
                )}
                {s.phase === "negotiate" && own && (
                  <>
                    <div className="button-row">
                      <button
                        className="primary"
                        disabled={!can("ready")}
                        onClick={() => send({ type: "ready" })}
                      >
                        Open interventions ↗
                      </button>
                      <button
                        className="secondary"
                        disabled={!can("escape")}
                        onClick={() => send({ type: "escape" })}
                      >
                        Try to escape
                      </button>
                    </div>
                    <p className="small-note">
                      Escape on 5–6. No rewards. Failed escape costs Chill.
                    </p>
                  </>
                )}
                {s.phase === "intervene" && (
                  <>
                    <p>
                      One intervention per player. The server resolves after
                      everyone passes or the timer ends.
                    </p>
                    <div className="button-row">
                      <button
                        className="primary"
                        disabled={!can("pass")}
                        onClick={() => send({ type: "pass" })}
                      >
                        {s.encounter?.passed.includes(s.selfId)
                          ? "You passed"
                          : "Pass / done"}
                      </button>
                      <button
                        className="secondary"
                        disabled={!can("protect")}
                        onClick={() => send({ type: "protect" })}
                      >
                        Protect party ·{" "}
                        {bundle.campaign.rules.protectionCost ?? 1} favor
                      </button>
                    </div>
                  </>
                )}
                {s.encounter?.logs.map((line, i) => (
                  <p key={i} className="effect-log">
                    {line}
                  </p>
                ))}
                {s.phase === "cleanup" && (
                  <div className="cleanup-summary">
                    <strong>Encounter resolved.</strong>
                    <p>{s.log.slice(-2).join(" ")}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="draw-zone">
              <h2>Some growth is just a nap.</h2>
              <p>{s.log.at(-1)}</p>
            </div>
          )}
          {s.phase === "negotiate" && s.players.length > 1 && (
            <div className="deal-panel">
              <span className="tiny-label">
                A LITTLE MUTUALLY BENEFICIAL ARRANGEMENT
              </span>
              {s.encounter?.helperId ? (
                <p>
                  <b>
                    {
                      s.players.find((p) => p.id === s.encounter!.helperId)
                        ?.name
                    }
                  </b>{" "}
                  is helping for{" "}
                  {amount(s.encounter.deal!.amount, s.encounter.deal!.currency)}{" "}
                  {labels[s.encounter.deal!.currency]} +{" "}
                  {s.encounter.deal!.loot} loot, paid only if you win.
                </p>
              ) : (
                <>
                  {own && (
                    <form
                      className="deal-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        send({
                          type: "offer",
                          helperId: helper,
                          currency,
                          amount: payment,
                          loot,
                        });
                      }}
                    >
                      <label>
                        Ask a friend
                        <select
                          aria-label="Helper"
                          value={helper}
                          onChange={(e) => setHelper(e.target.value)}
                          required
                        >
                          <option value="">Choose someone</option>
                          {s.players
                            .filter(
                              (p) =>
                                p.id !== s.selfId &&
                                p.connected &&
                                !p.triggered,
                            )
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label>
                        Currency
                        <select
                          aria-label="Offer currency"
                          value={currency}
                          onChange={(e) => {
                            setCurrency(e.target.value as Currency);
                            setPayment(0);
                          }}
                        >
                          {currencies.map((c) => (
                            <option key={c} value={c}>
                              {labels[c]}
                              {c === "btc" ? " (sats)" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Amount
                        <input
                          aria-label="Offer amount"
                          type="number"
                          min="0"
                          max={me.wallet[currency]}
                          value={payment}
                          onChange={(e) => setPayment(Number(e.target.value))}
                        />
                      </label>
                      <label>
                        Loot
                        <input
                          aria-label="Offer loot"
                          type="number"
                          min="0"
                          max={encounter?.loot ?? 0}
                          value={loot}
                          onChange={(e) => setLoot(Number(e.target.value))}
                        />
                      </label>
                      <button
                        className="secondary"
                        disabled={!can("offer") || !helper}
                      >
                        Offer help deal
                      </button>
                    </form>
                  )}
                  {s.encounter?.offer && (
                    <div className="offer-banner">
                      <p>
                        {lead.name} offers{" "}
                        {amount(
                          s.encounter.offer.amount,
                          s.encounter.offer.currency,
                        )}{" "}
                        {labels[s.encounter.offer.currency]} and{" "}
                        {s.encounter.offer.loot} loot to{" "}
                        {
                          s.players.find(
                            (p) => p.id === s.encounter!.offer!.helperId,
                          )?.name
                        }
                        .
                      </p>
                      {can("accept") && (
                        <div className="button-row">
                          <button
                            className="primary"
                            onClick={() =>
                              send({
                                type: "accept",
                                offerId: s.encounter!.offer!.id,
                              })
                            }
                          >
                            Accept deal
                          </button>
                          <button
                            className="secondary"
                            onClick={() => send({ type: "decline" })}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {!own && !s.encounter?.offer && (
                    <p>
                      {lead.name} can ask one player for help. Negotiation is
                      voluntary; no helper gains a level.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <aside className={`build-panel ${buildExpanded ? "expanded" : ""}`}>
          <div className="section-heading">
            <h2>Your situation</h2>
            <span>LEVEL {me.level}</span>
          </div>
          <div className="chill-track">
            <span>Chill</span>
            <div>
              {Array.from(
                { length: bundle.campaign.rules.maxChill },
                (_, i) => (
                  <i key={i} className={i < me.chill ? "filled" : ""} />
                ),
              )}
            </div>
            <b>
              {me.chill}/{bundle.campaign.rules.maxChill}
            </b>
          </div>
          <button
            className="build-toggle text-button"
            onClick={() => setBuildExpanded(!buildExpanded)}
          >
            {buildExpanded
              ? "Hide build details"
              : "Inspect your class, traits & wallet"}{" "}
            ↗
          </button>
          <div className="wallet">
            {currencies.map((c) => (
              <div key={c}>
                <span>{labels[c]}</span>
                <b>{amount(me.wallet[c], c)}</b>
              </div>
            ))}
          </div>
          {me.classCard && detail(me.classCard)}
          <h3 className="tiny-label">
            TRAITS · {me.traits.length}/{bundle.campaign.rules.traitSlots}
          </h3>
          {me.traits.map(detail)}
          <h3 className="tiny-label">
            GEAR · {me.equipment.length}/{bundle.campaign.rules.equipmentSlots}
          </h3>
          {me.equipment.map(detail)}
          {own && s.phase === "prepare" && (
            <button
              className="secondary full"
              disabled={
                !can("therapy") ||
                me.chill === bundle.campaign.rules.maxChill ||
                (!me.wallet.therapy_healedness &&
                  me.wallet.cash_cp < bundle.campaign.rules.therapyPrice)
              }
              onClick={() => send({ type: "therapy" })}
            >
              Therapy ·{" "}
              {me.wallet.therapy_healedness
                ? "1 recovery token"
                : `${bundle.campaign.rules.therapyPrice} cash`}{" "}
              (+{bundle.campaign.rules.therapyHeal} Chill)
            </button>
          )}
          <button
            className="text-button"
            onClick={() => setShowBoard(!showBoard)}
          >
            {showBoard ? "Hide" : "Inspect"} other builds ↗
          </button>
          {showBoard &&
            s.players
              .filter((p) => p.id !== s.selfId)
              .map((p) => (
                <div className="other-build" key={p.id}>
                  <h3>{p.name}</h3>
                  {p.classCard && detail(p.classCard)}
                  {p.traits.map(detail)}
                  {p.equipment.map(detail)}
                  <small>
                    {currencies
                      .map((c) => `${labels[c]} ${amount(p.wallet[c], c)}`)
                      .join(" · ")}
                  </small>
                </div>
              ))}
        </aside>
      </div>
      {s.phase === "cleanup" && own && (
        <div className="cleanup-panel">
          <div>
            <span className="tiny-label">BEFORE THE NEXT BAD DECISION</span>
            <h2>
              {me.pendingTrait
                ? "A personality update."
                : "Your turn, wrapped."}
            </h2>
          </div>
          {me.pendingTrait ? (
            <div className="trait-choice">
              <GameCard card={defs[me.pendingTrait.cardId]} compact />
              <div>
                <p>Keep this trait by replacing one, or discard it.</p>
                {me.traits.map((t) => (
                  <button
                    className="secondary"
                    disabled={busy}
                    key={t.instanceId}
                    onClick={() =>
                      send({ type: "choose_trait", replaceId: t.instanceId })
                    }
                  >
                    Replace {defs[t.cardId].name}
                  </button>
                ))}
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() => send({ type: "choose_trait", discard: true })}
                >
                  Discard new trait
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>
                {me.handCount > 5
                  ? `Discard ${me.handCount - 5} action cards below before ending your turn.`
                  : "Your build is saved. Let someone else have a problem."}
              </p>
              <button
                className="primary"
                disabled={!can("end_turn") || me.handCount > 5}
                onClick={() => send({ type: "end_turn" })}
              >
                End turn ↗
              </button>
            </>
          )}
        </div>
      )}
      <section className="hand-section">
        <div className="section-heading">
          <h2>
            Your hand <span>{me.handCount} / 5</span>
          </h2>
          <p>
            Private to you ·{" "}
            {s.phase === "intervene"
              ? "Play one card, then pass."
              : "Hold these for the intervention window."}
          </p>
        </div>
        <div className="hand-cards">
          {me.hand?.map((c) => (
            <GameCard card={defs[c.cardId]} key={c.instanceId} compact>
              {s.phase === "intervene" ? (
                <button
                  className="primary full"
                  disabled={
                    !can("play") ||
                    (defs[c.cardId].effects.some((e) => e.kind === "escape") &&
                      !own)
                  }
                  onClick={() =>
                    send({ type: "play", instanceId: c.instanceId })
                  }
                >
                  Play card
                </button>
              ) : own && s.phase === "cleanup" ? (
                <button
                  className="secondary full"
                  disabled={busy}
                  onClick={() =>
                    send({ type: "discard", instanceId: c.instanceId })
                  }
                >
                  Discard
                </button>
              ) : null}
            </GameCard>
          ))}
          {!me.handCount && (
            <p className="empty-state">
              No cards. An excellent time to practice restraint.
            </p>
          )}
        </div>
      </section>
      {s.phase === "prepare" && (
        <section className="market-section">
          <div className="section-heading">
            <h2>The questionable essentials shop</h2>
            <span>One purchase per turn</span>
          </div>
          {own && me.equipment.length >= 2 && (
            <label className="replace-gear">
              If buying, replace
              <select
                aria-label="Equipment to replace"
                value={replaceGear}
                onChange={(e) => setReplaceGear(e.target.value)}
              >
                <option value="">Choose equipment</option>
                {me.equipment.map((c) => (
                  <option key={c.instanceId} value={c.instanceId}>
                    {defs[c.cardId].name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="market-cards">
            {s.market.map((c) => {
              const def = defs[c.cardId],
                price = def.price!;
              return (
                <GameCard card={def} compact key={c.instanceId}>
                  <button
                    className="secondary full"
                    disabled={
                      !can("buy") ||
                      me.wallet[price.currency] < price.amount ||
                      (me.equipment.length >= 2 && !replaceGear)
                    }
                    onClick={() =>
                      send({
                        type: "buy",
                        instanceId: c.instanceId,
                        ...(replaceGear ? { replaceId: replaceGear } : {}),
                      })
                    }
                  >
                    Buy · {amount(price.amount, price.currency)}{" "}
                    {labels[price.currency]}
                  </button>
                </GameCard>
              );
            })}
          </div>
        </section>
      )}
      <div className="table-shortcuts">
        <button
          onClick={() =>
            document
              .querySelector(".encounter-zone")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          Encounter ↑
        </button>
        <button
          onClick={() =>
            document
              .querySelector(".hand-section")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          Your hand · {s.phase === "intervene" ? `${remaining}s` : me.handCount}
        </button>
        <button
          onClick={() => {
            setBuildExpanded(true);
            document
              .querySelector(".build-panel")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Your build ↑
        </button>
      </div>
      <details className="table-log">
        <summary>Tonight’s receipts</summary>
        <ol>
          {s.log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </details>
      <div className="sr-only" aria-live="polite">
        {s.log.at(-1)}
      </div>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="card-modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close card"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <GameCard card={selected} />
          </section>
        </div>
      )}
    </section>
  );
}

function Rules() {
  return (
    <section className="rules-page">
      <span className="eyebrow">THE RULES / KEEP IT QUESTIONABLE</span>
      <h1>
        Romance is hard.
        <br />
        <em>The rules aren’t.</em>
      </h1>
      <div className="rules-list">
        {[
          [
            "01",
            "Get a personality",
            "Everyone starts at level 1 with 6 Chill, one class, two traits, one piece of gear, and three action cards. Your build is random.",
          ],
          [
            "02",
            "Face a red flag",
            "Reveal an encounter. Your level, equipment, class, and trait bonuses form your strength. Tags activate both bonuses and penalties. Higher strength wins; ties favor the encounter.",
          ],
          [
            "03",
            "Negotiate with friends",
            "Offer one player currency or loot to help. They must accept. Their strength joins yours, and payment happens only if you win. Only you gain the level.",
          ],
          [
            "04",
            "Let everyone interfere",
            "Each player may use one card or spend one social capital to protect the party. Pass when done. All passes or the 20-second timer resolves the encounter. Passed means passed.",
          ],
          [
            "05",
            "Win or escape",
            "Defeat a monster: gain one level, rewards, and a random trait. Escape succeeds on 5–6; failed escape costs Chill for you and your helper. Zero Chill means Triggered, a random discarded card, and recovery to 4 Chill on your next turn.",
          ],
          [
            "06",
            "Build as you go",
            "Keep at most three traits and two equipment cards. Replace a trait when you draw a new one, or discard the draw. Finish your turn with at most five action cards. Classes change only through explicit cards.",
          ],
          [
            "07",
            "Look after yourself",
            "Instead of revealing, self-care restores 3 Chill and draws one action. Therapy during preparation restores 3 Chill for a recovery token or 50 cash. Temporary Chill absorbs damage first. A favor protects against the next hostile intervention.",
          ],
          [
            "08",
            "Make it official",
            "At level 5, attempt one of three finales. Defeat it to win romance. After eight complete rounds without a winner, everyone gets an unsuccessful ending. No one is eliminated.",
          ],
          [
            "09",
            "A fresh start",
            "Rematches reset levels, wallets, classes, and equipment. Your discovered cards and endings stay in this browser. Export your collection to move it to another device. They never increase your power.",
          ],
        ].map(([n, title, text]) => (
          <article key={n}>
            <span>{n}</span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="small-note">
        All romance belongs to fictional adult characters. No personal
        disclosure, real matching, or roleplaying required. Cash, BTC, exposure,
        therapy, social capital, and temporary Chill stay separate; there is no
        exchange rate.
      </p>
    </section>
  );
}

function CollectionScreen({
  bundle,
  collection,
  onChange,
  onError,
}: {
  bundle: ContentBundle;
  collection: Collection;
  onChange: (c: Collection) => void;
  onError: (e: string) => void;
}) {
  const [query, setQuery] = useState(""),
    [kind, setKind] = useState("all"),
    [onlyFound, setOnlyFound] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const cards = bundle.cards.filter(
    (c) =>
      (kind === "all" || c.kind === kind) &&
      (!onlyFound || collection.cards.includes(c.id)) &&
      `${c.name} ${c.flavor} ${c.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function exportFile() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(collection, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "digital-nomadia-collection.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importFile(f?: File) {
    if (!f) return;
    try {
      if (f.size > 1_000_000)
        throw new Error("Collection files must be under 1 MB.");
      onChange(
        mergeCollection(
          collection,
          parseCollection(JSON.parse(await f.text())),
        ),
      );
    } catch (e) {
      onError((e as Error).message);
    }
    if (file.current) file.current.value = "";
  }
  return (
    <section>
      <span className="eyebrow">
        YOUR COLLECTION / SOUVENIRS, NOT SUPERPOWERS
      </span>
      <div className="page-title">
        <h1>
          Emotional
          <br />
          <em>baggage claim.</em>
        </h1>
        <div className="button-row">
          <button className="secondary" onClick={exportFile}>
            Export collection ↓
          </button>
          <button className="secondary" onClick={() => file.current?.click()}>
            Import collection ↑
          </button>
          <input
            hidden
            type="file"
            accept="application/json"
            ref={file}
            onChange={(e) => importFile(e.target.files?.[0])}
          />
        </div>
      </div>
      <p>
        {
          collection.cards.filter((id) => bundle.cards.some((c) => c.id === id))
            .length
        }{" "}
        / {bundle.cards.length} cards discovered · {collection.endings.length}{" "}
        personal endings. Saved in this browser.
      </p>
      <div className="filters">
        <label>
          Search cards
          <input
            placeholder="Ghosts, red flags, questionable gear…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Card type
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All types</option>
            {Object.keys(bundle.campaign.pools).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={onlyFound}
            onChange={(e) => setOnlyFound(e.target.checked)}
          />
          Discovered only
        </label>
      </div>
      <div className="collection-grid">
        {cards.map((c) => (
          <div key={c.id} className="collection-entry">
            <GameCard card={c} />
            <span className="discovery-state">
              {collection.cards.includes(c.id)
                ? "✦ DISCOVERED"
                : "○ NOT ENCOUNTERED YET"}
            </span>
          </div>
        ))}
      </div>
      {!cards.length && <p>No cards match. Your baggage may be elsewhere.</p>}
      {collection.endings.length > 0 && (
        <section>
          <h2>Your endings</h2>
          <div className="ending-list">
            {collection.endings.map((e) => (
              <article key={e.id}>
                <span>
                  {e.won ? "ROMANCE ACHIEVED" : "CHARACTER DEVELOPMENT"}
                </span>
                <p>{e.text}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
function Archive() {
  const [assets, setAssets] = useState<SourceAsset[]>([]),
    [query, setQuery] = useState(""),
    [family, setFamily] = useState("all"),
    [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/catalogue")
      .then((r) => {
        if (!r.ok) throw new Error("Archive unavailable.");
        return r.json();
      })
      .then((data) => setAssets(data.assets))
      .catch((e) => setError(e.message));
  }, []);
  const visible = assets.filter(
    (a) =>
      (family === "all" || a.family === family) &&
      `${a.name} ${a.tags.join(" ")} ${a.campaigns.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section>
      <span className="eyebrow">SOURCE ARCHIVE / THE ORIGINAL BAD IDEAS</span>
      <h1>
        Nothing funny
        <br />
        <em>left behind.</em>
      </h1>
      <p>
        {assets.length} source entries. Tags are inferred; catalogue candidates
        are separate from approved playable cards.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="filters">
        <label>
          Search archive
          <input
            placeholder="A class, trait, location, or joke…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Family
          <select value={family} onChange={(e) => setFamily(e.target.value)}>
            <option value="all">All families</option>
            {[...new Set(assets.map((a) => a.family))].sort().map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="small-note">{visible.length} matches · Showing first 100</p>
      <div className="archive-list">
        {visible.slice(0, 100).map((a) => (
          <details key={a.id}>
            <summary>
              <strong>{a.name}</strong>
              <span>
                {a.family} ·{" "}
                {a.candidates.length ? "card candidate" : "reference"}
              </span>
            </summary>
            <p>
              {a.tags.join(" · ")} / {a.campaigns.join(" · ")}
            </p>
            {a.sourceRefs.map((ref, i) => (
              <p className="source-ref" key={i}>
                {ref.path}
                {ref.row ? ` · record ${ref.row}` : ""}
                {ref.heading ? ` · ${ref.heading}` : ""}
              </p>
            ))}
          </details>
        ))}
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
