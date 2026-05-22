import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useColors } from "@/hooks/useColors";
import { fetchRoutes, type Route } from "@/lib/api";

function RouteCard({ route }: { route: Route }) {
  const colors = useColors();
  const shiftColor = route.shift === "AM" ? colors.accentOrange : colors.accentBlue;
  const pointCount = route.deliveryPoints?.length ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.shiftBadge, { backgroundColor: shiftColor + "22" }]}>
          <Text style={[styles.shiftText, { color: shiftColor }]}>{route.shift || "—"}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.routeName, { color: colors.foreground }]} numberOfLines={1}>
          {route.name}
        </Text>
        <Text style={[styles.routeCode, { color: colors.mutedForeground }]}>{route.code}</Text>
      </View>
      {pointCount > 0 ? (
        <View style={[styles.pointsBadge, { backgroundColor: colors.muted, borderRadius: 8 }]}>
          <Text style={[styles.pointsText, { color: colors.mutedForeground }]}>{pointCount}</Text>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
        </View>
      ) : (
        <Feather name="chevron-right" size={16} color={colors.border} />
      )}
    </Pressable>
  );
}

export default function RoutesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [search, setSearch] = useState("");

  const { data: routes = [], isLoading, refetch } = useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
  });

  const filtered = routes.filter(
    r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      (r.shift ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const amRoutes = filtered.filter(r => r.shift === "AM");
  const pmRoutes = filtered.filter(r => r.shift === "PM");
  const otherRoutes = filtered.filter(r => r.shift !== "AM" && r.shift !== "PM");

  type ListItem = { type: "header"; title: string } | { type: "route"; route: Route };
  const flatItems: ListItem[] = [];
  for (const [title, list] of [["AM Shift", amRoutes], ["PM Shift", pmRoutes], ["Other", otherRoutes]] as [string, Route[]][]) {
    if (list.length > 0) {
      flatItems.push({ type: "header", title });
      for (const route of list) flatItems.push({ type: "route", route });
    }
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Routes</Text>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search routes..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {flatItems.length === 0 ? (
        <EmptyState
          icon="clipboard"
          title={search ? "No matches" : "No routes yet"}
          subtitle={search ? "Try a different search" : "Routes will appear here once added via the web app"}
        />
      ) : (
        <FlatList
          data={flatItems}
          keyExtractor={(item, i) =>
            item.type === "header" ? `h-${item.title}` : `r-${item.route.id}-${i}`
          }
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 120 }}
          scrollEnabled={!!flatItems.length}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.mutedForeground} />
          }
          renderItem={({ item }) => {
            if (item.type === "header") {
              return (
                <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
                  {item.title}
                </Text>
              );
            }
            return <RouteCard route={item.route} />;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", padding: 0 },
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  cardLeft: {},
  cardBody: { flex: 1 },
  routeName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  routeCode: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  shiftBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  shiftText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
