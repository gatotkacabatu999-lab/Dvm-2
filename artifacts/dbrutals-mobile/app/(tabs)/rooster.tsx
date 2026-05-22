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
import { fetchRooster, type RoosterEntry } from "@/lib/api";

const AVATAR_COLOR_KEYS = [
  "accentBlue",
  "accentOrange",
  "accentViolet",
  "accentEmerald",
  "accentPink",
  "accentIndigo",
  "accentAmber",
] as const;

function MemberCard({ member, index }: { member: RoosterEntry; index: number }) {
  const colors = useColors();
  const colorKey = AVATAR_COLOR_KEYS[index % AVATAR_COLOR_KEYS.length];
  const avatarColor = (colors as Record<string, string>)[colorKey] ?? colors.accentBlue;
  const initials = member.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor + "22", borderRadius: 24 }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {member.name}
        </Text>
        {member.role ? (
          <Text style={[styles.role, { color: colors.mutedForeground }]}>{member.role}</Text>
        ) : null}
        {member.day ? (
          <Text style={[styles.dayText, { color: colors.mutedForeground }]}>{member.day}</Text>
        ) : null}
      </View>
      {member.shift ? (
        <View style={[styles.shiftChip, { backgroundColor: colors.muted, borderRadius: 8 }]}>
          <Text style={[styles.shiftText, { color: colors.mutedForeground }]}>{member.shift}</Text>
        </View>
      ) : (
        <Feather name="user" size={16} color={colors.border} />
      )}
    </View>
  );
}

export default function RoosterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["rooster"],
    queryFn: fetchRooster,
  });

  const members: RoosterEntry[] = data?.resources ?? [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Rooster</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.muted, borderRadius: 10 }]}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {members.length} members
          </Text>
        </View>
      </View>

      {members.length === 0 ? (
        <EmptyState
          icon="users"
          title="No team members"
          subtitle="Team members will appear here once added via the web app"
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 120 }}
          scrollEnabled={!!members.length}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.mutedForeground} />
          }
          renderItem={({ item, index }) => <MemberCard member={item} index={index} />}
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
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  countBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4 },
  countText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  avatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  role: { fontSize: 12, fontFamily: "Inter_400Regular" },
  dayText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  shiftChip: { paddingHorizontal: 10, paddingVertical: 4 },
  shiftText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
