import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Package,
  Images,
  Settings,
  Search,
  Sun,
  Moon,
  Zap,
  ChevronRight,
  MapPin,
  Route,
  Calendar,
  Camera,
  Layers,
  Pencil,
  X,
  Menu,
} from "lucide-react"
import "./_group.css"

const NAV = [
  {
    label: "Schedule",
    icon: Users,
    color: "#818cf8",
    children: ["Rooster"],
  },
  {
    label: "Vending Machine",
    icon: Package,
    color: "#34d399",
    children: ["Route List", "Location", "Custom"],
  },
  {
    label: "Gallery",
    icon: Images,
    color: "#f472b6",
    children: ["Plano VM", "Album"],
  },
]

const CHILD_ICONS: Record<string, React.ElementType> = {
  Rooster: Users,
  "Route List": Route,
  Location: MapPin,
  Custom: Layers,
  "Plano VM": Camera,
  Album: Images,
}

const PAGES = [
  { label: "Home", icon: LayoutDashboard },
  { label: "Calendar", icon: Calendar },
  { label: "Routes", icon: Route },
  { label: "Settings", icon: Settings },
]

export function FloatingSidebar() {
  const [expanded, setExpanded] = useState(true)
  const [dark, setDark] = useState(true)
  const [active, setActive] = useState("Home")
  const [openGroup, setOpenGroup] = useState<string | null>("Vending Machine")
  const [search, setSearch] = useState("")
  const [activePage, setActivePage] = useState("Routes")

  const bg = dark ? "#0f1117" : "#f4f5f7"
  const sidebar = dark ? "rgba(20,22,32,0.92)" : "rgba(255,255,255,0.92)"
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)"
  const text = dark ? "#e2e8f0" : "#1e293b"
  const muted = dark ? "#64748b" : "#94a3b8"
  const accent = "#3b82f6"
  const activeItemBg = dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.10)"
  const hoverBg = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
  const contentBg = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.015)"

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: bg,
        display: "flex",
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: "background 0.3s",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: dark
            ? "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.05) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.04) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* ── FLOATING SIDEBAR ── */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          bottom: 12,
          width: expanded ? 240 : 60,
          background: sidebar,
          border: `1px solid ${border}`,
          borderRadius: 18,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: dark
            ? "0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset"
            : "0 8px 32px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 12px 10px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: `1px solid ${border}`,
            flexShrink: 0,
          }}
        >
          {/* Logo pill */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: -0.5 }}>
              FM
            </span>
          </div>
          {expanded && (
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Dbrutals
              </div>
              <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>Route Manager</div>
            </div>
          )}
          {/* Collapse toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: hoverBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              color: muted,
              transition: "all 0.18s",
            }}
          >
            {expanded ? <X size={13} /> : <Menu size={13} />}
          </button>
        </div>

        {/* Search (expanded only) */}
        {expanded && (
          <div style={{ padding: "10px 12px 6px", flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${border}`,
                borderRadius: 9,
                padding: "6px 10px",
              }}
            >
              <Search size={12} color={muted} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 12,
                  color: text,
                  flex: 1,
                  minWidth: 0,
                }}
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px", minHeight: 0 }}>
          {NAV.map(group => {
            const Icon = group.icon
            const isOpen = openGroup === group.label
            const filteredChildren = group.children.filter(c =>
              !search || c.toLowerCase().includes(search.toLowerCase())
            )
            if (search && filteredChildren.length === 0) return null

            return (
              <div key={group.label} style={{ marginBottom: 2 }}>
                {/* Group header */}
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: expanded ? "8px 10px" : "8px",
                    borderRadius: 10,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: text,
                    transition: "background 0.15s",
                    justifyContent: expanded ? "flex-start" : "center",
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: group.color + "22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} color={group.color} />
                  </div>
                  {expanded && (
                    <>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, textAlign: "left" }}>
                        {group.label}
                      </span>
                      <ChevronRight
                        size={13}
                        color={muted}
                        style={{
                          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    </>
                  )}
                </button>

                {/* Children */}
                {(expanded || !expanded) && isOpen && expanded && (
                  <div style={{ paddingLeft: 12, paddingBottom: 4 }}>
                    {filteredChildren.map(child => {
                      const ChildIcon = CHILD_ICONS[child] || Package
                      const isActive = active === child
                      return (
                        <button
                          key={child}
                          onClick={() => setActive(child)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6.5px 10px",
                            borderRadius: 8,
                            border: "none",
                            background: isActive ? activeItemBg : "transparent",
                            cursor: "pointer",
                            color: isActive ? accent : muted,
                            marginBottom: 1,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={e => {
                            if (!isActive)
                              ;(e.currentTarget as HTMLButtonElement).style.background = hoverBg
                          }}
                          onMouseLeave={e => {
                            if (!isActive)
                              ;(e.currentTarget as HTMLButtonElement).style.background =
                                "transparent"
                          }}
                        >
                          <ChildIcon size={13} />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: isActive ? 600 : 400,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {child}
                          </span>
                          {isActive && (
                            <div
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: accent,
                                marginLeft: "auto",
                              }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${border}`,
            padding: "10px 8px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Theme toggle */}
          <button
            onClick={() => setDark(!dark)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: expanded ? "7px 10px" : "7px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: muted,
              transition: "background 0.15s",
              justifyContent: expanded ? "flex-start" : "center",
              width: "100%",
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLButtonElement).style.background = hoverBg)
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
            }
          >
            {dark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#818cf8" />}
            {expanded && (
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {dark ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>

          {/* Edit mode */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: expanded ? "7px 10px" : "7px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: muted,
              transition: "background 0.15s",
              justifyContent: expanded ? "flex-start" : "center",
              width: "100%",
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLButtonElement).style.background = hoverBg)
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
            }
          >
            <Pencil size={14} color="#34d399" />
            {expanded && <span style={{ fontSize: 12, fontWeight: 500 }}>Edit Mode</span>}
          </button>

          {/* Action */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: expanded ? "7px 10px" : "7px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: muted,
              transition: "background 0.15s",
              justifyContent: expanded ? "flex-start" : "center",
              width: "100%",
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLButtonElement).style.background = hoverBg)
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
            }
          >
            <Zap size={14} color="#fbbf24" />
            {expanded && <span style={{ fontSize: 12, fontWeight: 500 }}>Actions</span>}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div
        style={{
          flex: 1,
          marginLeft: expanded ? 268 : 88,
          transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          padding: "16px 20px 16px 0",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: text, margin: 0 }}>
              Route List
            </h1>
            <p style={{ fontSize: 12, color: muted, margin: "2px 0 0" }}>
              5 active routes · Today
            </p>
          </div>
          {/* Page tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              borderRadius: 10,
              padding: 4,
              border: `1px solid ${border}`,
            }}
          >
            {PAGES.map(p => {
              const Icon = p.icon
              const isAct = activePage === p.label
              return (
                <button
                  key={p.label}
                  onClick={() => setActivePage(p.label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    borderRadius: 7,
                    border: "none",
                    background: isAct ? (dark ? "rgba(59,130,246,0.2)" : "#fff") : "transparent",
                    color: isAct ? accent : muted,
                    cursor: "pointer",
                    fontSize: 11.5,
                    fontWeight: isAct ? 600 : 400,
                    transition: "all 0.15s",
                    boxShadow: isAct
                      ? dark
                        ? "none"
                        : "0 1px 4px rgba(0,0,0,0.08)"
                      : "none",
                  }}
                >
                  <Icon size={13} />
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Route cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
            flex: 1,
            alignContent: "start",
          }}
        >
          {[
            { id: "R01", name: "North Loop", stops: 8, status: "active", color: "#34d399" },
            { id: "R02", name: "South Bay", stops: 6, status: "active", color: "#3b82f6" },
            { id: "R03", name: "East District", stops: 11, status: "pending", color: "#fbbf24" },
            { id: "R04", name: "West End", stops: 5, status: "active", color: "#f472b6" },
            { id: "R05", name: "Central Hub", stops: 14, status: "active", color: "#818cf8" },
            { id: "R06", name: "Waterfront", stops: 9, status: "pending", color: "#fb923c" },
          ].map(route => (
            <div
              key={route.id}
              style={{
                background: contentBg,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.18s",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = "translateY(-2px)"
                el.style.boxShadow = dark
                  ? "0 8px 24px rgba(0,0,0,0.3)"
                  : "0 8px 24px rgba(0,0,0,0.08)"
                el.style.borderColor = route.color + "44"
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = ""
                el.style.boxShadow = ""
                el.style.borderColor = border
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: route.color + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Route size={14} color={route.color} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: route.color,
                    background: route.color + "18",
                    padding: "2px 7px",
                    borderRadius: 6,
                    letterSpacing: 0.5,
                  }}
                >
                  {route.id}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 4 }}>
                {route.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={11} color={muted} />
                <span style={{ fontSize: 11, color: muted }}>{route.stops} stops</span>
                <div
                  style={{
                    marginLeft: "auto",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: route.status === "active" ? "#34d399" : "#fbbf24",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: route.status === "active" ? "#34d399" : "#fbbf24",
                    fontWeight: 500,
                  }}
                >
                  {route.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Label strip */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: muted,
              background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${border}`,
              borderRadius: 7,
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <div
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }}
            />
            Floating smart sidebar — hover the ✕ to collapse to icon rail
          </div>
        </div>
      </div>
    </div>
  )
}
