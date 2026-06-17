import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { YouTubeCourse } from '../api/youtube';
import { colors, spacing, radius } from '../constants/theme';
import { formatLessonCount } from '../utils/format';

interface Props {
  course: YouTubeCourse;
  onPress: () => void;
}

export default function CourseCard({ course, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.thumbnailContainer}>
        {course.thumbnail_url ? (
          <Image source={{ uri: course.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailPlaceholderText}>SF</Text>
          </View>
        )}
        {course.lesson_count > 0 && (
          <View style={styles.lessonBadge}>
            <Text style={styles.lessonBadgeText}>{formatLessonCount(course.lesson_count)}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{course.category}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        {course.description ? (
          <Text style={styles.description} numberOfLines={2}>{course.description}</Text>
        ) : null}
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
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    color: colors.onPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  lessonBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  lessonBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSecondaryContainer,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
});
