import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ChevronLeft, Award, Share2, Calendar, CheckCircle } from 'lucide-react-native';
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
  const [shared, setShared] = useState(false);

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const date = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const html = generateCertificateHtml({ userName, courseTitle, score, total, completedAt });
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${courseTitle} — Certificate`,
          UTI: 'com.adobe.pdf',
        });
        setShared(true);
      } else {
        setError('Sharing is not available on this device.');
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate PDF.');
    } finally {
      setGenerating(false);
    }
  }, [userName, courseTitle, score, total, completedAt]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.onSurface} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Certificate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Certificate card */}
        <View style={styles.certCard}>
          {/* Blue header section */}
          <View style={styles.certHeader}>
            {/* Decorative circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            {/* Brand */}
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>SF</Text>
              </View>
              <Text style={styles.brandName}>SkillForge</Text>
            </View>

            {/* Award icon */}
            <View style={styles.awardWrapper}>
              <Award size={40} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
            </View>

            <Text style={styles.certLabel}>OFFICIAL CERTIFICATE</Text>
            <Text style={styles.certTitle}>Certificate of{'\n'}Completion</Text>
          </View>

          {/* Body */}
          <View style={styles.certBody}>
            <Text style={styles.presentedTo}>Proudly presented to</Text>
            <Text style={styles.studentName}>{userName}</Text>
            <View style={styles.divider} />

            <Text style={styles.completionText}>has successfully completed</Text>
            <Text style={styles.courseName}>{courseTitle}</Text>

            {/* Meta row */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={14} color={colors.outline} strokeWidth={2} />
                <View>
                  <Text style={styles.metaLabel}>Completed</Text>
                  <Text style={styles.metaValue}>{date}</Text>
                </View>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <CheckCircle size={14} color="#2e7d32" strokeWidth={2} />
                <View>
                  <Text style={styles.metaLabel}>Quiz Score</Text>
                  <Text style={styles.metaValue}>{score}/{total} · {percent}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer stripe */}
          <View style={styles.certFooter}>
            <Text style={styles.footerText}>Issued by SkillForge · skillforge.app</Text>
            <View style={styles.footerAccent} />
          </View>
        </View>

        {/* Pass badge */}
        <View style={styles.passBadgeRow}>
          <View style={styles.passBadge}>
            <CheckCircle size={14} color="#1b5e20" strokeWidth={2.5} />
            <Text style={styles.passBadgeText}>Quiz Passed</Text>
          </View>
          <Text style={styles.passScore}>{score}/{total} correct · {percent}%</Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Share button */}
        <TouchableOpacity
          style={[styles.shareButton, generating && styles.shareButtonDisabled]}
          onPress={handleShare}
          disabled={generating}
          activeOpacity={0.85}
        >
          {generating ? (
            <ActivityIndicator color={colors.onPrimary} size="small" />
          ) : (
            <>
              <Share2 size={20} color={colors.onPrimary} strokeWidth={2} />
              <Text style={styles.shareButtonText}>
                {shared ? 'Share Again' : 'Download & Share PDF'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          The PDF opens your device's share sheet — save to Files, email, or share anywhere.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* ── Header ─────────────────────────────── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
  },

  /* ── Scroll ──────────────────────────────── */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.margin,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },

  /* ── Certificate card ────────────────────── */
  certCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },

  /* Blue header */
  certHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -50,
    left: 160,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -40,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  awardWrapper: {
    marginBottom: spacing.md,
  },
  certLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2.5,
    marginBottom: spacing.xs,
  },
  certTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.6,
    lineHeight: 36,
  },

  /* Body */
  certBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  presentedTo: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  studentName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  completionText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  courseName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
    lineHeight: 26,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.outlineVariant,
  },

  /* Footer stripe */
  certFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  footerText: {
    fontSize: 11,
    color: colors.outline,
    fontWeight: '500',
  },
  footerAccent: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.tertiaryContainer,
  },

  /* ── Pass badge row ──────────────────────── */
  passBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  passBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#e8f5e9',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  passBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b5e20',
  },
  passScore: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },

  /* ── Error ───────────────────────────────── */
  errorBox: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: colors.onErrorContainer,
  },

  /* ── Share button ────────────────────────── */
  shareButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
    marginTop: spacing.xs,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
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
