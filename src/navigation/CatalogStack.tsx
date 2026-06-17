import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import CourseDetailScreen from '../screens/course/CourseDetailScreen';
import LessonPlayerScreen from '../screens/course/LessonPlayerScreen';
import QuizScreen from '../screens/quiz/QuizScreen';
import QuizResultScreen from '../screens/quiz/QuizResultScreen';

export type LessonSummary = {
  youtube_video_id: string;
  title: string;
  position: number;
  duration_seconds: number;
};

export type CatalogStackParamList = {
  CatalogHome: undefined;
  CourseDetail: {
    playlistId: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    lesson_count: number;
  };
  LessonPlayer: {
    videoId: string;
    title: string;
    description: string | null;
    position: number;
    courseTitle: string;
    playlistId: string;
    lessons: LessonSummary[];
  };
  Quiz: {
    courseId: string;
    courseTitle: string;
    playlistId: string;
  };
  QuizResult: {
    quizId: string;
    score: number;
    total: number;
    passed: boolean;
    courseTitle: string;
    playlistId: string;
  };
};

const Stack = createStackNavigator<CatalogStackParamList>();

export default function CatalogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CatalogHome" component={CatalogScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="LessonPlayer" component={LessonPlayerScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
    </Stack.Navigator>
  );
}
