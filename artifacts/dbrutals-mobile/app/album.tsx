import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useColors } from "@/hooks/useColors";
import { fetchRoutes, type DeliveryPoint, type Route } from "@/lib/api";

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  routeName: string;
}

function usePhotoItems(): { photos: PhotoItem[]; routes: Route[] } {
  const { data: routes = [] } = useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
  });

  const photos = useMemo(() => {
    const items: PhotoItem[] = [];
    for (const route of routes) {
      for (const point of route.deliveryPoints ?? []) {
        const url = point.avatarImageUrl ?? point.qrCodeImageUrl;
        if (url) {
          items.push({
            id: `${route.id}-${point.code ?? point.name ?? url}`,
            url,
            caption: point.name ?? point.code ?? "Location",
            routeName: route.name,
          });
        }
      }
    }
    return items;
  }, [routes]);

  return { photos, routes };
}

function PhotoCard({ item }: { item: PhotoItem }) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.photoCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Image
        source={{ uri: item.url }}
        style={[styles.photo, { borderRadius: colors.radius - 2 }]}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.photoMeta}>
        <Text style={[styles.photoCaption, { color: colors.foreground }]} numberOfLines={1}>
          {item.caption}
        </Text>
        <Text style={[styles.photoRoute, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.routeName}
        </Text>
      </View>
    </Pressable>
  );
}

function RouteCard({ route }: { route: Route }) {
  const colors = useColors();
  const pointsWithImages = (route.deliveryPoints ?? []).filter(
    (p: DeliveryPoint) => p.avatarImageUrl ?? p.qrCodeImageUrl,
  );
  const shiftColor = route.shift === "AM" ? colors.accentOrange : colors.accentBlue;

  return (
    <View
      style={[
        styles.routeCard,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={styles.routeHeader}>
        <View style={[styles.shiftBadge, { backgroundColor: shiftColor + "22" }]}>
          <Text style={[styles.shiftText, { color: shiftColor }]}>{route.shift || "—"}</Text>
        </View>
        <View style={styles.routeInfo}>
          <Text style={[styles.routeName, { color: colors.foreground }]} numberOfLines={1}>
            {route.name}
          </Text>
          <Text style={[styles.routeCode, { color: colors.mutedForeground }]}>{route.code}</Text>
        </View>
        <View style={styles.imageCount}>
          <Feather name="image" size={13} color={colors.mutedForeground} />
          <Text style={[styles.imageCountText, { color: colors.mutedForeground }]}>
            {pointsWithImages.length}
          </Text>
        </View>
      </View>
      {route.deliveryPoints && route.deliveryPoints.length > 0 && (
        <View style={[styles.routeStats, { borderTopColor: colors.border }]}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.routeStatsText, { color: colors.mutedForeground }]}>
            {route.deliveryPoints.length} delivery points
          </Text>
        </View>
      )}
    </View>
  );
}

export default function AlbumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: routes = [], isLoading, refetch } = useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
  });

  const { photos } = usePhotoItems();

  if (isLoading) return <LoadingSpinner />;

  const hasPhotos = photos.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {routes.length === 0 ? (
        <EmptyState
          icon="image"
          title="No album content"
          subtitle="Route photos will appear here once routes and delivery points are configured"
        />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: bottomPad + (Platform.OS === "web" ? 34 : insets.bottom + 20),
          }}
          scrollEnabled={!!routes.length}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.mutedForeground} />
          }
          ListHeaderComponent={
            hasPhotos ? (
              <View style={styles.photosSection}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PHOTOS</Text>
                <FlatList
                  data={photos.slice(0, 6)}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
                  renderItem={({ item }) => <PhotoCard item={item} />}
                  scrollEnabled
                />
              </View>
            ) : null
          }
          ListHeaderComponentStyle={{ marginBottom: 4 }}
          renderItem={({ item }) => {
            return (
              <View style={styles.routeWrapper}>
                {item === routes[0] && (
                  <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ROUTES</Text>
                )}
                <RouteCard route={item} />
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  photosSection: { marginBottom: 8 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  photoCard: {
    width: 140,
    borderWidth: 1,
    overflow: "hidden",
  },
  photo: { width: 140, height: 100 },
  photoMeta: { padding: 10 },
  photoCaption: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  photoRoute: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  routeWrapper: { marginBottom: 8 },
  routeCard: { borderWidth: 1, overflow: "hidden" },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  shiftBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  shiftText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  routeInfo: { flex: 1 },
  routeName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  routeCode: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  imageCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  imageCountText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  routeStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  routeStatsText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
