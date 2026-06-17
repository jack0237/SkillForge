# 🗺️ SkillForge - Technical Roadmap (Issue-Based)

Ce document définit la séquence de développement pour transformer les designs en une application fonctionnelle. Chaque issue doit être validée avant de passer à la suivante.

---

## 🏗️ Phase 1 : Fondations & Sécurité

### Issue #1 : Configuration de l'Infrastructure
- **Objectif** : Prêt pour le développement.
- **Tâches** :
  - Configurer le client Supabase dans \src/api/supabase.ts\.
  - Valider le chargement des variables d'environnement (.env).
  - Créer les types TypeScript globaux pour les Cours, Leçons et Profils dans \src/types/\.
- **Livrable** : App capable de ping Supabase.

### Issue #2 : Authentification & Onboarding
- **Design** : Se baser sur \Sdesign/welcome_to_skillforge\ et \Sdesign/login_sign_up_new\.
- **Tâches** :
  - Implémenter \AuthContext\ pour gérer l'état de l'utilisateur.
  - Écran de Bienvenue (Welcome).
  - Écrans Login/Inscription avec validation de formulaire.
  - Liaison avec Supabase Auth (Email/Pass).
- **Livrable** : Flux d'authentification complet avec redirection automatique.

---

## 🔍 Phase 2 : Découverte & Catalogue

### Issue #3 : Service d'Intégration YouTube Data API
- **Objectif** : Abstraction de la donnée.
- **Tâches** :
  - Créer un service dans \src/api/youtube.ts\.
  - Implémenter la recherche (\category=27\) et la récupération de playlists.
  - Mapper les données YouTube vers nos types internes.
- **Livrable** : Fonctions de fetch testées et typées.

### Issue #4 : Catalogue & Recherche (UI/UX)
- **Design** : Se baser sur \Sdesign/course_catalog_search\.
- **Tâches** :
  - Liste de cours avec défilement infini ou pagination.
  - Barre de recherche avec **Debounce** (500ms).
  - Filtres par catégories.
- **Livrable** : Navigation fluide dans le catalogue éducatif.

---

## 📖 Phase 3 : Expérience d'Apprentissage

### Issue #5 : Lecteur de Leçon Interactif
- **Design** : Se baser sur \Sdesign/lesson_view\.
- **Tâches** :
  - Intégration de \eact-native-youtube-iframe\.
  - Gestion de \expo-keep-awake\ pendant le visionnage.
  - Affichage de la description et des métadonnées.
- **Livrable** : Écran de cours fonctionnel sans mise en veille.

### Issue #6 : Système de Notes & Persistance
- **Tâches** :
  - Créer une table \
otes\ dans Supabase.
  - Input texte auto-sauvegardé pour chaque leçon.
  - Bouton \"Marquer comme terminé\" mettant à jour la progression.
- **Livrable** : Notes persistantes par utilisateur et par leçon.

---

## 📊 Phase 4 : Progression & Dashboard

### Issue #7 : Dashboard Utilisateur
- **Design** : Se baser sur \Sdesign/learning_dashboard_1\.
- **Tâches** :
  - Calculer le pourcentage de progression par playlist.
  - Afficher les cours actifs et les statistiques (Streak).
  - Gérer les états \loading\ et \empty\ (\Sdesign/my_courses_empty_state\).
- **Livrable** : Vision claire de l'avancement pour l'étudiant.

---

## 🎓 Phase 5 : Validation & Certification

### Issue #8 : Moteur de Quiz
- **Design** : Se baser sur \Sdesign/course_quiz_visual_hierarchy\.
- **Tâches** :
  - Structure de données Quiz dans Supabase.
  - Écran de QCM (5 questions) avec feedback immédiat.
  - Calcul du score et écran de résultat.
- **Livrable** : Système de validation des acquis fonctionnel.

### Issue #9 : Bonus - Génération de Certificat PDF
- **Tâches** :
  - Template HTML/CSS pour le certificat.
  - Utilisation de \expo-print\ pour générer le PDF.
  - Partage natif via \expo-sharing\.
- **Livrable** : Récompense tangible après réussite du quiz.

---

## 🛠️ Phase 6 : Polissage & Qualité
### Issue #10 : Notifications & Gamification
- Rappels locaux via \expo-notifications\.
- Optimisation des performances (mémoïsation, images).
- Finalisation du README technique.
