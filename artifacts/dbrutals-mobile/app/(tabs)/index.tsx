import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";
import { fetchRoutes, type Route } from "@/lib/api";

const QUICK_TILES = [
  { id: "routes", label: "Routes", icon: "clipboard", color: "accentViolet", tab: "routes" },
  { id: "rooster", label: "Rooster", icon: "users", color: "accentOrange", tab: "rooster" },
  { id: "calendar", label: "Calendar", icon: "calendar", color: "accentBlue", tab: "calendar" },
  { id: "deliveries", label: "Deliveries", icon: "map-pin", color: "accentEmerald", tab: "deliveries" },
] as const;

function QuickTile({
  icon,
  label,
  colorKey,
  onPress,
}: {
  icon: string;
  label: string;
  colorKey: string;
  onPress: () => void;
}) {
  const colors = useColors();
  const tileColor = (colors as Record<string, string>)[colorKey] ?? colors.accentBlue;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: tileColor + "22", borderRadius: colors.radius - 4 }]}>
        {/* @ts-ignore */}
        <Feather name={icon} size={22} color={tileColor} />
      </View>
      <Text style={[styles.tileLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

function RouteRow({ route }: { route: Route }) {
  const colors = useColors();
  const shiftColor = route.shift === "AM" ? colors.accentOrange : colors.accentBlue;
  return (
    <View style={[styles.routeRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={[styles.shiftBadge, { backgroundColor: shiftColor + "22" }]}>
        <Text style={[styles.shiftText, { color: shiftColor }]}>{route.shift || "—"}</Text>
      </View>
      <View style={styles.routeInfo}>
        <Text style={[styles.routeName, { color: colors.foreground }]} numberOfLines={1}>{route.name}</Text>
        <Text style={[styles.routeCode, { color: colors.mutedForeground }]}>{route.code}</Text>
      </View>
      <View style={[styles.activeDot, { backgroundColor: colors.accentEmerald }]} />
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: routes = [], isLoading, refetch } = useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
  });

  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: bottomPad + 120, paddingHorizontal: 16 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.mutedForeground} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{dayName}, {dateStr}</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Dashboard</Text>
        </View>
        <View style={[styles.logoBadge, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <Feather name="truck" size={20} color={colors.foreground} />
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>QUICK ACCESS</Text>
      <View style={styles.tileGrid}>
        {QUICK_TILES.map(tile => (
          <QuickTile
            key={tile.id}
            icon={tile.icon}
            label={tile.label}
            colorKey={tile.color}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/(tabs)/${tile.tab}` as never);
            }}
          />
        ))}
      </View>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ROUTES</Text>
        <Pressable onPress={() => router.push("/(tabs)/routes" as never)}>
          <Text style={[styles.seeAll, { color: colors.accentBlue }]}>See all</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={[styles.skeletonCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]} />
      ) : routes.length === 0 ? (
        <EmptyState icon="inbox" title="No routes found" subtitle="Routes will appear here once added" />
      ) : (
        <View style={styles.routeList}>
          {routes.slice(0, 6).map(route => (
            <RouteRow key={route.id} route={route} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 2 },
  heroTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  logoBadge: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 10 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  tile: {
    width: "47%",
    padding: 16,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: 12,
  },
  tileIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  tileLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  routeList: { gap: 8 },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  shiftBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  shiftText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  routeInfo: { flex: 1 },
  routeName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  routeCode: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  skeletonCard: { height: 72, borderWidth: 1 },
});
