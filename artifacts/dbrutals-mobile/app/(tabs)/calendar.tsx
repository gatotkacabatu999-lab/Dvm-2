import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useColors } from "@/hooks/useColors";
import { fetchCalendar, type CalendarEvent } from "@/lib/api";

function formatEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function isToday(dateStr: string): boolean {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}

function EventCard({ event }: { event: CalendarEvent }) {
  const colors = useColors();
  const today = isToday(event.date);
  const accentColor = event.color ?? colors.accentBlue;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: today ? accentColor : colors.border,
          borderRadius: colors.radius,
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={2}>
          {event.title}
        </Text>
        {today && (
          <View
            style={[
              styles.todayBadge,
              { backgroundColor: colors.accentEmerald + "22", borderRadius: 6 },
            ]}
          >
            <Text style={[styles.todayText, { color: colors.accentEmerald }]}>Today</Text>
          </View>
        )}
      </View>
      <View style={styles.cardMeta}>
        <Feather name="calendar" size={12} color={colors.mutedForeground} />
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
          {formatEventDate(event.date)}
        </Text>
        {event.type ? (
          <>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Text style={[styles.typeText, { color: colors.mutedForeground }]}>{event.type}</Text>
          </>
        ) : null}
      </View>
      {event.description ? (
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}
    </View>
  );
}

export default function CalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ["calendar"],
    queryFn: fetchCalendar,
  });

  const sorted = useMemo(
    () =>
      [...events].sort((a, b) => {
        try {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } catch {
          return 0;
        }
      }),
    [events],
  );

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const upcoming = sorted.filter(e => {
    try {
      return new Date(e.date) >= todayStart;
    } catch {
      return true;
    }
  });
  const past = sorted
    .filter(e => {
      try {
        return new Date(e.date) < todayStart;
      } catch {
        return false;
      }
    })
    .reverse()
    .slice(0, 10);

  type ListItem = { type: "section"; title: string } | { type: "event"; event: CalendarEvent };
  const items: ListItem[] = [
    ...(upcoming.length > 0 ? [{ type: "section" as const, title: "Upcoming" }] : []),
    ...upcoming.map(e => ({ type: "event" as const, event: e })),
    ...(past.length > 0 ? [{ type: "section" as const, title: "Past" }] : []),
    ...past.map(e => ({ type: "event" as const, event: e })),
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Calendar</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {upcoming.length} upcoming event{upcoming.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No events"
          subtitle="Calendar events will appear here once added via the web app"
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) =>
            item.type === "section" ? `s-${item.title}` : `e-${item.event.id}-${i}`
          }
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 120 }}
          scrollEnabled={!!items.length}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.mutedForeground} />
          }
          renderItem={({ item }) => {
            if (item.type === "section") {
              return (
                <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
                  {item.title}
                </Text>
              );
            }
            return <EventCard event={item.event} />;
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
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  card: { borderWidth: 1, padding: 14, marginBottom: 8, gap: 8 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  eventTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  todayBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  todayText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
  typeText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
