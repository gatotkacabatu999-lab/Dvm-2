import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function SettingRow({
  icon,
  label,
  subtitle,
  onPress,
  value,
  accent,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  value?: string;
  accent?: string;
}) {
  const colors = useColors();
  const rowColor = accent ?? colors.foreground;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          opacity: pressed && !!onPress ? 0.75 : 1,
        },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: rowColor + "18", borderRadius: 8 }]}>
        {/* @ts-ignore */}
        <Feather name={icon} size={17} color={rowColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
      ) : onPress ? (
        <Feather name="chevron-right" size={16} color={colors.border} />
      ) : null}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title}</Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();

  const handleRefreshData = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    queryClient.invalidateQueries();
    Alert.alert("Refreshed", "All data has been refreshed from the server.");
  }, [queryClient]);

  const handleBack = () => router.back();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: bottomPad + 40,
      }}
    >
      <SectionHeader title="APPEARANCE" />
      <View style={[styles.section, { borderColor: colors.border }]}>
        <SettingRow
          icon="moon"
          label="Theme"
          subtitle="Follows your device system setting"
          value={colorScheme === "dark" ? "Dark" : "Light"}
        />
      </View>

      <SectionHeader title="DATA" />
      <View style={[styles.section, { borderColor: colors.border }]}>
        <SettingRow
          icon="refresh-cw"
          label="Refresh All Data"
          subtitle="Force re-fetch routes, roster, calendar & deliveries"
          onPress={handleRefreshData}
          accent={colors.accentBlue}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="server"
          label="API Domain"
          subtitle="Connected to your Replit deployment"
          value={process.env.EXPO_PUBLIC_DOMAIN ? "Connected" : "Local"}
        />
      </View>

      <SectionHeader title="NAVIGATION" />
      <View style={[styles.section, { borderColor: colors.border }]}>
        <SettingRow
          icon="clipboard"
          label="Routes"
          onPress={() => { router.back(); router.push("/(tabs)/routes" as never); }}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="users"
          label="Rooster"
          onPress={() => { router.back(); router.push("/(tabs)/rooster" as never); }}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="calendar"
          label="Calendar"
          onPress={() => { router.back(); router.push("/(tabs)/calendar" as never); }}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="map-pin"
          label="Location"
          onPress={() => { router.back(); router.push("/(tabs)/deliveries" as never); }}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="package"
          label="Plano VM"
          onPress={() => { router.back(); router.push("/plano" as never); }}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="image"
          label="Album"
          onPress={() => { router.back(); router.push("/album" as never); }}
        />
      </View>

      <SectionHeader title="ABOUT" />
      <View style={[styles.section, { borderColor: colors.border }]}>
        <SettingRow icon="truck" label="Dbrutals Mobile" value="v1.0.0" />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow
          icon="globe"
          label="Platform"
          value={Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web"}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 6,
    marginHorizontal: 16,
  },
  section: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    minHeight: 52,
  },
  rowIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
