import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
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
import { fetchDeliveries, type DeliveryRecord } from "@/lib/api";

function DeliveryCard({ record }: { record: DeliveryRecord }) {
  const colors = useColors();
  const statusColor =
    record.status === "completed"
      ? colors.accentEmerald
      : record.status === "pending"
      ? colors.accentAmber
      : colors.accentBlue;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <View style={styles.info}>
        <Text style={[styles.location, { color: colors.foreground }]} numberOfLines={1}>
          {record.location ?? record.routeName ?? "Location"}
        </Text>
        {record.date ? (
          <View style={styles.meta}>
            <Feather name="clock" size={11} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{record.date}</Text>
          </View>
        ) : null}
        {record.notes ? (
          <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={1}>
            {record.notes}
          </Text>
        ) : null}
      </View>
      {record.status ? (
        <View style={[styles.statusChip, { backgroundColor: statusColor + "22", borderRadius: 8 }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function DeliveriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ["deliveries"],
    queryFn: fetchDeliveries,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Deliveries</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {records.length} record{records.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {records.length === 0 ? (
        <EmptyState
          icon="map-pin"
          title="No deliveries"
          subtitle="Delivery records will appear here once logged"
        />
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 120 }}
          scrollEnabled={!!records.length}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.mutedForeground} />}
          renderItem={({ item }) => <DeliveryCard record={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  screenTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  card: { flexDirection: "row", alignItems: "center", borderWidth: 1, padding: 14, marginBottom: 8, gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  info: { flex: 1, gap: 3 },
  location: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  notes: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
