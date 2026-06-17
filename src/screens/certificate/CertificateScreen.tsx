import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Download, Share2, ChevronLeft } from 'lucide-react-native';
import { CatalogStackParamList } from '../../navigation/CatalogStack';
import { generateCertificateHtml } from '../../utils/certificate';
import { colors, spacing, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<CatalogStackParamList, 'Certificate'>;
  route: RouteProp<CatalogStackParamList, 'Certificate'>;
};

export default function CertificateScreen({ navigation, route }: Props) {
  const { userName, courseTitle, score, total, completedAt } = route.params;

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const html = generateCertificateHtml({ userName, courseTitle, score, total, completedAt });

  const handleGenerateAndShare = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${courseTitle} — Certificate`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        setError('Sharing is not available on this device.');
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate certificate.');
    } finally {
      setGenerating(false);
    }
  }, [html, courseTitle]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={24} color={colors.onSurface} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Certificate</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Certificate preview */}
      <View style={styles.previewContainer}>
        <WebView
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
        />
      </View>

      {/* Info + actions */}
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>✓ Quiz Passed</Text>
          </View>
          <Text style={styles.infoScore}>{score}/{total} · {Math.round((score / total) * 100)}%</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, generating && styles.primaryButtonDisabled]}
          onPress={handleGenerateAndShare}
          disabled={generating}
          activeOpacity={0.85}
        >
          {generating ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Share2 size={20} color={colors.onPrimary} strokeWidth={2} />
              <Text style={styles.primaryButtonText}>Download & Share PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          The PDF will open your device's share sheet — save it to Files, send via email, or share anywhere.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
  },
  previewContainer: {
    flex: 1,
    marginHorizontal: spacing.margin,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  footer: {
    paddingHorizontal: spacing.margin,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b5e20',
  },
  infoScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  errorText: {
    fontSize: 13,
    color: colors.onErrorContainer,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: colors.outline,
    textAlign: 'center',
    lineHeight: 18,
  },
});
