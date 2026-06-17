import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { CatalogStackParamList } from '../../navigation/CatalogStack';
import { syncCourse, syncLesson } from '../../api/catalog';
import { getNote, saveNote, getLessonCompleted, markLessonComplete } from '../../api/learner';
import { hasDailyReminder, scheduleDailyReminder } from '../../api/notifications';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius } from '../../constants/theme';
import { formatDuration } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';

type Props = {
  navigation: StackNavigationProp<CatalogStackParamList, 'LessonPlayer'>;
  route: RouteProp<CatalogStackParamList, 'LessonPlayer'>;
};

const KEEP_AWAKE_TAG = 'lesson-player';

type SyncState = 'idle' | 'syncing' | 'ready' | 'error';

export default function LessonPlayerScreen({ navigation, route }: Props) {
  const { videoId, title, description, position, courseTitle, playlistId, lessons } = route.params;
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const playerHeight = Math.round(width * (9 / 16));

  const currentIndex = lessons.findIndex((l) => l.youtube_video_id === videoId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Player state
  const [playing, setPlaying] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Sync state — course/lesson must be in Supabase before notes/progress work
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const courseIdRef = useRef<string | null>(null);
  const lessonIdRef = useRef<string | null>(null);

  // Notes state
  const [noteContent, setNoteContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debouncedNote = useDebounce(noteContent, 1000);
  const isFirstNoteLoad = useRef(true);

  // Progress state
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Keep screen awake while playing
  useEffect(() => {
    if (playing) {
      activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    } else {
      deactivateKeepAwake(KEEP_AWAKE_TAG);
    }
    return () => { deactivateKeepAwake(KEEP_AWAKE_TAG); };
  }, [playing]);

  // Sync course & lesson to Supabase, then load notes + progress
  useEffect(() => {
    if (!user) return;
    setSyncState('syncing');

    (async () => {
      try {
        const courseId = await syncCourse(playlistId, courseTitle);
        courseIdRef.current = courseId;

        const currentLesson = lessons[currentIndex];
        const lessonId = await syncLesson(
          {
            youtube_video_id: videoId,
            title,
            description: description ?? null,
            duration_seconds: currentLesson?.duration_seconds ?? 0,
            position,
          },
          courseId,
        );
        lessonIdRef.current = lessonId;

        const [savedNote, isCompleted] = await Promise.all([
          getNote(lessonId),
          getLessonCompleted(lessonId),
        ]);

        setNoteContent(savedNote);
        setCompleted(isCompleted);
        setSyncState('ready');
      } catch {
        setSyncState('error');
      }
    })();
  }, [videoId, user]);

  // Auto-save note when debounced content changes
  useEffect(() => {
    if (isFirstNoteLoad.current) {
      isFirstNoteLoad.current = false;
      return;
    }
    if (syncState !== 'ready' || !lessonIdRef.current || !user) return;

    setSaveStatus('saving');
    saveNote(lessonIdRef.current, debouncedNote, user.id)
      .then(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      })
      .catch(() => setSaveStatus('idle'));
  }, [debouncedNote]);

  const onStateChange = useCallback((state: string) => {
    if (state === 'playing') setPlaying(true);
    if (state === 'paused') setPlaying(false);
    if (state === 'ended') {
      setPlaying(false);
      handleMarkComplete();
    }
  }, [lessonIdRef.current, courseIdRef.current, user]);

  const handleMarkComplete = useCallback(async () => {
    if (completed || !lessonIdRef.current || !courseIdRef.current || !user) return;
    setCompleting(true);
    try {
      await markLessonComplete(lessonIdRef.current, courseIdRef.current, user.id);
      setCompleted(true);
      // Refresh daily reminder so the body reflects any streak change
      const hasReminder = await hasDailyReminder();
      if (hasReminder) {
        scheduleDailyReminder(0); // streak will be recalculated on next dashboard load
      }
    } finally {
      setCompleting(false);
    }
  }, [completed, user]);

  const navigateToLesson = useCallback(
    (lesson: (typeof lessons)[number]) => {
      navigation.replace('LessonPlayer', {
        videoId: lesson.youtube_video_id,
        title: lesson.title,
        description: null,
        position: lesson.position,
        courseTitle,
        playlistId,
        lessons,
      });
    },
    [navigation, courseTitle, playlistId, lessons],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* YouTube Player */}
      <View style={[styles.playerContainer, { height: playerHeight }]}>
        <YoutubeIframe
          videoId={videoId}
          height={playerHeight}
          play={playing}
          onChangeState={onStateChange}
          webViewStyle={{ opacity: 0.99 }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
          initialPlayerParams={{ preventFullScreen: false, cc_lang_pref: 'en', showClosedCaptions: false }}
        />
        <TouchableOpacity
          style={styles.backOverlay}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.backButton}>
            <ChevronLeft size={20} color="#fff" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentInner, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.breadcrumb} numberOfLines={1}>{courseTitle}</Text>
          {completed && (
            <View style={styles.completedBadge}>
              <CheckCircle size={12} color="#2e7d32" strokeWidth={2.5} />
              <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
          )}
        </View>

        <Text style={styles.positionLabel}>
          Lesson {position + 1} of {lessons.length}
          {lessons[currentIndex]?.duration_seconds > 0
            ? ` · ${formatDuration(lessons[currentIndex].duration_seconds)}`
            : ''}
        </Text>

        <Text style={styles.lessonTitle}>{title}</Text>

        {/* Description */}
        {description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText} numberOfLines={descriptionExpanded ? undefined : 3}>
              {description}
            </Text>
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setDescriptionExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              {descriptionExpanded
                ? <ChevronUp size={16} color={colors.primary} strokeWidth={2} />
                : <ChevronDown size={16} color={colors.primary} strokeWidth={2} />
              }
              <Text style={styles.expandText}>
                {descriptionExpanded ? 'Show less' : 'Show more'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Notes section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Notes</Text>
            {saveStatus === 'saving' && (
              <Text style={styles.saveStatus}>Saving...</Text>
            )}
            {saveStatus === 'saved' && (
              <Text style={[styles.saveStatus, styles.saveStatusSaved]}>Saved ✓</Text>
            )}
          </View>
          {syncState === 'syncing' ? (
            <View style={styles.notesLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : syncState === 'error' ? (
            <View style={styles.notesLoading}>
              <Text style={styles.errorText}>Notes unavailable — check your connection.</Text>
            </View>
          ) : (
            <TextInput
              style={styles.notesInput}
              value={noteContent}
              onChangeText={setNoteContent}
              placeholder="Take notes on this lesson..."
              placeholderTextColor={colors.outline}
              multiline
              textAlignVertical="top"
            />
          )}
        </View>

        {/* Mark as Complete */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            completed && styles.completeButtonDone,
            (completing || syncState !== 'ready') && styles.completeButtonDisabled,
          ]}
          onPress={handleMarkComplete}
          disabled={completed || completing || syncState !== 'ready'}
          activeOpacity={0.85}
        >
          {completing ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : completed ? (
            <>
              <CheckCircle size={20} color="#2e7d32" strokeWidth={2.5} />
              <Text style={styles.completeButtonTextDone}>Completed</Text>
            </>
          ) : (
            <>
              <Circle size={20} color={colors.onPrimary} strokeWidth={2} />
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Prev / Next */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navButton, !prevLesson && styles.navButtonDisabled]}
            onPress={() => prevLesson && navigateToLesson(prevLesson)}
            disabled={!prevLesson}
            activeOpacity={0.75}
          >
            <ChevronLeft size={16} color={prevLesson ? colors.primary : colors.outline} strokeWidth={2} />
            <View style={styles.navButtonText}>
              <Text style={[styles.navLabel, !prevLesson && styles.navLabelDisabled]}>Previous</Text>
              {prevLesson && (
                <Text style={styles.navLessonTitle} numberOfLines={1}>{prevLesson.title}</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.navDivider} />

          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight, !nextLesson && styles.navButtonDisabled]}
            onPress={() => nextLesson && navigateToLesson(nextLesson)}
            disabled={!nextLesson}
            activeOpacity={0.75}
          >
            <View style={[styles.navButtonText, { alignItems: 'flex-end' }]}>
              <Text style={[styles.navLabel, !nextLesson && styles.navLabelDisabled]}>Next</Text>
              {nextLesson && (
                <Text style={styles.navLessonTitle} numberOfLines={1}>{nextLesson.title}</Text>
              )}
            </View>
            <ChevronRight size={16} color={nextLesson ? colors.primary : colors.outline} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  backOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentInner: {
    paddingHorizontal: spacing.margin,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breadcrumb: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2e7d32',
  },
  positionLabel: {
    fontSize: 12,
    color: colors.outline,
    marginTop: -spacing.sm,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  descriptionSection: {
    gap: spacing.xs,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  saveStatus: {
    fontSize: 12,
    color: colors.outline,
  },
  saveStatusSaved: {
    color: '#2e7d32',
  },
  notesLoading: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
  },
  notesInput: {
    minHeight: 120,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },
  completeButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  completeButtonDone: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1.5,
    borderColor: '#a5d6a7',
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  completeButtonTextDone: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLowest,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  navButtonRight: {
    justifyContent: 'flex-end',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    flex: 1,
    gap: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navLabelDisabled: {
    color: colors.outline,
  },
  navLessonTitle: {
    fontSize: 13,
    color: colors.onSurface,
    fontWeight: '500',
  },
  navDivider: {
    width: 1,
    backgroundColor: colors.outlineVariant,
  },
});
