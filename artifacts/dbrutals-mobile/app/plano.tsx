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
import { fetchPlano, type PlanoPage, type PlanoProduct } from "@/lib/api";

const STOCK_COLORS = ["#3B82F6", "#F97316", "#92400E", "#22C55E", "#A855F7", "#EC4899", "#EAB308"];

function ProductRow({ product, index }: { product: PlanoProduct; index: number }) {
  const colors = useColors();
  const dotColor = product.color ?? STOCK_COLORS[index % STOCK_COLORS.length];

  return (
    <View style={[styles.productRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.colorDot, { backgroundColor: dotColor }]} />
      <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>
        {product.name ?? product.code ?? `Product ${index + 1}`}
      </Text>
      <View style={styles.productStats}>
        {product.stockIn !== undefined && (
          <View style={[styles.statChip, { backgroundColor: colors.accentBlue + "22" }]}>
            <Text style={[styles.statText, { color: colors.accentBlue }]}>{product.stockIn}</Text>
          </View>
        )}
        {product.moveFront !== undefined && (
          <View style={[styles.statChip, { backgroundColor: colors.accentAmber + "22" }]}>
            <Text style={[styles.statText, { color: colors.accentAmber }]}>{product.moveFront}</Text>
          </View>
        )}
        {product.expired !== undefined && product.expired > 0 && (
          <View style={[styles.statChip, { backgroundColor: colors.destructive + "22" }]}>
            <Text style={[styles.statText, { color: colors.destructive }]}>{product.expired}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function PageCard({ page, index }: { page: PlanoPage; index: number }) {
  const colors = useColors();
  const products: PlanoProduct[] = page.products ?? [];

  return (
    <View
      style={[
        styles.pageCard,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <View style={styles.pageHeader}>
        <View style={[styles.pageNumBadge, { backgroundColor: colors.muted, borderRadius: 8 }]}>
          <Text style={[styles.pageNum, { color: colors.mutedForeground }]}>#{index + 1}</Text>
        </View>
        <Text style={[styles.pageName, { color: colors.foreground }]} numberOfLines={1}>
          {page.name ?? `Page ${index + 1}`}
        </Text>
        <View style={styles.productCount}>
          <Feather name="package" size={13} color={colors.mutedForeground} />
          <Text style={[styles.productCountText, { color: colors.mutedForeground }]}>
            {products.length}
          </Text>
        </View>
      </View>

      {page.description ? (
        <Text style={[styles.pageDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {page.description}
        </Text>
      ) : null}

      {products.length > 0 ? (
        <View style={[styles.productList, { borderTopColor: colors.border }]}>
          {products.slice(0, 5).map((p, i) => (
            <ProductRow key={p.id ?? i} product={p} index={i} />
          ))}
          {products.length > 5 && (
            <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
              +{products.length - 5} more products
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function PlanoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { data: pages = [], isLoading, refetch } = useQuery({
    queryKey: ["plano"],
    queryFn: fetchPlano,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {pages.length === 0 ? (
        <EmptyState
          icon="package"
          title="No planogram data"
          subtitle="Planogram pages will appear here once configured via the web app"
        />
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(item, i) => item.id ?? String(i)}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: bottomPad + (Platform.OS === "web" ? 34 : insets.bottom + 20),
          }}
          scrollEnabled={!!pages.length}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.mutedForeground} />
          }
          renderItem={({ item, index }) => <PageCard page={item} index={index} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageCard: { borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  pageNumBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  pageNum: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  pageName: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  productCount: { flexDirection: "row", alignItems: "center", gap: 4 },
  productCountText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  pageDesc: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  productList: { borderTopWidth: StyleSheet.hairlineWidth },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  productName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  productStats: { flexDirection: "row", gap: 6 },
  statChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  statText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  moreText: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
