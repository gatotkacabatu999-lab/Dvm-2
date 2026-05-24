"use client"

import * as React from "react"
import fmLogo from "../../icon/fmlogo.png"
import sidebarBgLogo from "../../icon/IMG_0011.jpeg"
import {
  ChevronsUpDown,
  Cog,
  House,
  Images,
  LayoutGrid,
  Loader2,
  MapPin,
  Moon,
  Package,
  Pencil,
  Search,
  Sliders,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEditMode } from "@/contexts/EditModeContext"
import { useTheme } from "@/hooks/use-theme"
import { useSidebar, Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  page: string
  icon: React.ElementType
  iconColor?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

// ─── Navigation config ───────────────────────────────────────────────────────

const NAV_HOME: NavItem = {
  label: "Home",
  page: "home",
  icon: House,
  iconColor: "hsl(var(--accent-indigo))",
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Operations",
    items: [
      { label: "Route List",  page: "route-list",    icon: Package,    iconColor: "hsl(var(--accent-emerald))" },
      { label: "Location",    page: "deliveries",    icon: MapPin,     iconColor: "hsl(var(--accent-amber))" },
      { label: "Custom",      page: "custom",        icon: Sliders,    iconColor: "hsl(var(--accent-rose))" },
    ],
  },
  {
    title: "Schedule",
    items: [
      { label: "Rooster",     page: "rooster",       icon: Users,      iconColor: "hsl(var(--accent-indigo))" },
    ],
  },
  {
    title: "Gallery",
    items: [
      { label: "Plano VM",    page: "plano-vm",      icon: LayoutGrid, iconColor: "hsl(var(--accent-emerald))" },
      { label: "Album",       page: "gallery-album", icon: Images,     iconColor: "hsl(var(--accent-pink))" },
    ],
  },
]

// ─── Small helpers ────────────────────────────────────────────────────────────

function matchesSearch(text: string, q: string) {
  return text.toLowerCase().includes(q.toLowerCase())
}

// ─── Nav button ───────────────────────────────────────────────────────────────

function NavButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-all duration-150
        ${isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        }`}
    >
      <Icon
        className="size-[15px] shrink-0 transition-colors duration-150"
        style={{ color: isActive ? item.iconColor : undefined }}
      />
      <span className="truncate">{item.label}</span>
      {isActive && (
        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppSidebar({
  onNavigate,
  currentPage,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onNavigate?: (page: string) => void
  currentPage?: string
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [actionOpen, setActionOpen] = React.useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = React.useState(false)
  const [isEditModeTransitioning, setIsEditModeTransitioning] = React.useState(false)

  const { setOpenMobile } = useSidebar()
  const { isEditMode, setIsEditMode, hasUnsavedChanges, saveChanges, isSaving, discardChanges } = useEditMode()
  const { mode, toggleMode } = useTheme()

  const q = searchQuery.trim()

  // ── Filtered nav ──────────────────────────────────────────────────────────
  const filteredSections = React.useMemo<NavSection[]>(() => {
    if (!q) return NAV_SECTIONS
    return NAV_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item =>
        matchesSearch(item.label, q) || matchesSearch(section.title, q)
      ),
    })).filter(section => section.items.length > 0)
  }, [q])

  const showHome = !q || matchesSearch("Home", q)

  const noResults =
    q.length > 0 &&
    !showHome &&
    filteredSections.length === 0 &&
    !matchesSearch("Settings", q)

  // ── Navigation handler ───────────────────────────────────────────────────
  const navigate = React.useCallback(
    (page: string) => {
      onNavigate?.(page)
      setOpenMobile(false)
    },
    [onNavigate, setOpenMobile]
  )

  // ── Edit mode ─────────────────────────────────────────────────────────────
  const applyEditModeChange = (next: boolean) => {
    setIsEditModeTransitioning(true)
    window.setTimeout(() => {
      setIsEditMode(next)
      setIsEditModeTransitioning(false)
    }, 260)
  }

  const handleEditModeToggle = () => {
    if (isEditModeTransitioning) return
    if (isEditMode && hasUnsavedChanges) {
      setUnsavedDialogOpen(true)
    } else {
      applyEditModeChange(!isEditMode)
    }
  }

  const isSettingsActive = currentPage?.startsWith("settings") ?? false

  return (
    <>
      <Sidebar {...props} variant="floating">
        <div className="flex flex-col h-full min-h-0">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <SidebarHeader className="p-0 shrink-0">
            <div className="relative overflow-hidden h-[110px] rounded-t-[18px]">
              <img
                src={sidebarBgLogo}
                alt=""
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${
                  mode === "light" ? "opacity-75" : "opacity-60"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/70" />
            </div>

            {/* Search ───────────────────────────────────────────────────── */}
            <div className="relative px-3 pt-2 pb-1">
              <Search className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 size-[14px] text-muted-foreground" />
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-muted/40 pl-9 pr-7 text-[12.5px] outline-none ring-0 transition-all duration-150 placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring focus:bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </SidebarHeader>

          {/* ── Content ─────────────────────────────────────────────────── */}
          <SidebarContent className="px-2 py-1 gap-0 overflow-y-auto min-h-0">

            {/* Home */}
            {showHome && (
              <div className="mb-1">
                <NavButton
                  item={NAV_HOME}
                  isActive={currentPage === "home"}
                  onClick={() => navigate("home")}
                />
              </div>
            )}

            {/* Sections */}
            {filteredSections.map((section, si) => (
              <div key={section.title} className={si > 0 || showHome ? "mt-1" : ""}>
                <p className="px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                  {section.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map(item => (
                    <NavButton
                      key={item.page}
                      item={item}
                      isActive={currentPage === item.page}
                      onClick={() => navigate(item.page)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Settings */}
            {(!q || matchesSearch("Settings", q)) && (
              <div className="mt-1">
                <p className="px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                  System
                </p>
                <NavButton
                  item={{ label: "Settings", page: "settings", icon: Cog, iconColor: "hsl(var(--accent-amber))" }}
                  isActive={isSettingsActive}
                  onClick={() => navigate("settings")}
                />
              </div>
            )}

            {/* No results */}
            {noResults && (
              <div className="flex flex-col items-center gap-1.5 py-8 text-center animate-in fade-in duration-200">
                <p className="text-xs font-medium text-muted-foreground">No results</p>
                <p className="text-[11px] text-muted-foreground/50">Try a different keyword</p>
              </div>
            )}
          </SidebarContent>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <SidebarFooter className="px-2 pb-2 pt-1 shrink-0 border-t border-sidebar-border/40">

            {/* Action dropdown */}
            <DropdownMenu open={actionOpen} onOpenChange={setActionOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-lg border border-sidebar-border/50 bg-sidebar-accent/20 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-sidebar-accent/40 data-[state=open]:bg-sidebar-accent/50"
                  data-state={actionOpen ? "open" : "closed"}
                >
                  <Zap className="size-[15px] shrink-0 text-amber-400" />
                  <span className="flex-1 text-[13px] font-medium text-sidebar-foreground">Action</span>
                  <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-52 rounded-xl z-[70]"
                side="top"
                align="end"
                sideOffset={6}
              >
                <DropdownMenuLabel className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                  Quick Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Theme */}
                <DropdownMenuItem
                  onSelect={e => { e.preventDefault(); toggleMode() }}
                  className="flex items-center gap-2 cursor-pointer py-2.5"
                >
                  {mode === "dark"
                    ? <Moon className="size-4 shrink-0 text-indigo-400" />
                    : <Sun  className="size-4 shrink-0 text-amber-400" />}
                  <span className="flex-1 text-[12.5px]">
                    {mode === "dark" ? "Dark Mode" : "Light Mode"}
                  </span>
                  <span onClick={e => e.stopPropagation()}>
                    <Switch
                      size="sm"
                      className="fcal-switch-sidebar"
                      checked={mode === "dark"}
                      onCheckedChange={toggleMode}
                    />
                  </span>
                </DropdownMenuItem>

                {/* Edit mode */}
                <DropdownMenuItem
                  onSelect={e => { e.preventDefault(); handleEditModeToggle() }}
                  className={`flex items-center gap-2 cursor-pointer py-2.5 ${isEditMode ? "text-primary" : ""}`}
                >
                  {isEditModeTransitioning
                    ? <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                    : <Pencil className={`size-4 shrink-0 ${isEditMode ? "text-emerald-400" : "text-muted-foreground"}`} />}
                  <span className="flex-1 text-[12.5px]">
                    {isEditModeTransitioning ? "Switching…" : "Edit Mode"}
                  </span>
                  {!isEditModeTransitioning && (
                    <span onClick={e => e.stopPropagation()}>
                      <Switch
                        size="sm"
                        className="fcal-switch-sidebar"
                        checked={isEditMode}
                        onCheckedChange={handleEditModeToggle}
                      />
                    </span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* FM Logo */}
            <button
              type="button"
              onClick={() => navigate("home")}
              className="mx-auto flex items-center justify-center rounded-xl p-1 hover:bg-sidebar-accent/40 transition-colors duration-150"
            >
              <img
                src={fmLogo}
                alt="FM logo"
                className="h-[72px] w-[72px] shrink-0 object-contain"
              />
            </button>
          </SidebarFooter>

        </div>
      </Sidebar>

      {/* Action backdrop */}
      {actionOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150"
          onClick={() => setActionOpen(false)}
        />
      )}

      {/* Unsaved changes dialog */}
      <Dialog open={unsavedDialogOpen} onOpenChange={setUnsavedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. What would you like to do before turning off Edit Mode?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                discardChanges()
                setUnsavedDialogOpen(false)
                setIsEditMode(false)
              }}
            >
              Discard Changes
            </Button>
            <Button
              onClick={async () => {
                await saveChanges()
                setUnsavedDialogOpen(false)
                setIsEditMode(false)
              }}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save & Turn Off"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
