import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CourseProgress } from '../api/dashboard';
import { colors, spacing, radius } from '../constants/theme';

interface Props {
  course: CourseProgress;
  onPress: () => void;
}

export default function CourseProgressCard({ course, onPress }: Props) {
  const hasPercent = course.lesson_count > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {course.thumbnail_url ? (
          <Image source={{ uri: course.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.thumbnailPlaceholderText}>SF</Text>
          </View>
        )}
        {course.progress_percent === 100 && (
          <View style={styles.completedOverlay}>
            <Text style={styles.completedOverlayText}>✓ Completed</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: hasPercent ? `${course.progress_percent}%` : '0%',
              backgroundColor:
                course.progress_percent === 100 ? '#2e7d32' : colors.primary,
            },
          ]}
        />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.bodyTop}>
          <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
          <View style={styles.continueButton}>
            <Text style={styles.continueText}>
              {course.progress_percent === 100 ? 'Review' : 'Continue'}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {course.completed_lessons} of{' '}
          {hasPercent ? `${course.lesson_count} lessons` : `${course.completed_lessons} lessons`}
          {hasPercent ? ` · ${course.progress_percent}%` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceContainerHigh,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
  },
  thumbnailPlaceholderText: {
    color: colors.onPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  completedOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedOverlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  bodyTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.onSurface,
    lineHeight: 21,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  continueText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
