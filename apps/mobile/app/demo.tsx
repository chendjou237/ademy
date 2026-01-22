import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import {
  AppText,
  Button,
  Input,
  Card,
  ProgressBar,
  Badge
} from '../components/ui';

export default function DemoScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { locale, setLocale } = useI18n();

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleButtonPress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const toggleLanguage = () => {
    setLocale(locale === 'fr' ? 'en' : 'fr');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <AppText variant="h1" color="primary" align="center">
            Ademy
          </AppText>
          <AppText variant="h3" color="text" align="center" style={{ marginTop: theme.spacing.sm }}>
            Design System Demo
          </AppText>
          <AppText variant="body" color="textSecondary" align="center" style={{ marginTop: theme.spacing.xs }}>
            Plateforme d&apos;apprentissage africaine
          </AppText>
        </View>

        {/* Theme Controls */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Contrôles du Thème
          </AppText>

          <View style={styles.controlRow}>
            <Button
              variant="outline"
              onPress={toggleTheme}
              style={{ flex: 1, marginRight: theme.spacing.sm }}
            >
              {isDark ? 'Mode Clair' : 'Mode Sombre'}
            </Button>

            <Button
              variant="secondary"
              onPress={toggleLanguage}
              style={{ flex: 1, marginLeft: theme.spacing.sm }}
            >
              {locale === 'fr' ? 'English' : 'Français'}
            </Button>
          </View>
        </Card>

        {/* Typography Showcase */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Typographie
          </AppText>

          <AppText variant="h1" color="text" style={{ marginBottom: theme.spacing.sm }}>
            Titre H1 - Ademy
          </AppText>
          <AppText variant="h2" color="text" style={{ marginBottom: theme.spacing.sm }}>
            Titre H2 - Cours en ligne
          </AppText>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.sm }}>
            Titre H3 - Apprentissage
          </AppText>
          <AppText variant="body" color="text" style={{ marginBottom: theme.spacing.sm }}>
            Corps de texte - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginBottom: theme.spacing.sm }}>
            Petit texte - Information secondaire
          </AppText>
          <AppText variant="caption" color="textLight">
            Légende - Texte très petit pour les détails
          </AppText>
        </Card>

        {/* Buttons Showcase */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Boutons
          </AppText>

          <Button
            onPress={handleButtonPress}
            loading={loading}
            style={{ marginBottom: theme.spacing.md }}
          >
            Bouton Principal
          </Button>

          <Button
            variant="secondary"
            onPress={() => {}}
            style={{ marginBottom: theme.spacing.md }}
          >
            Bouton Secondaire
          </Button>

          <Button
            variant="outline"
            onPress={() => {}}
            style={{ marginBottom: theme.spacing.md }}
          >
            Bouton Contour
          </Button>

          <Button
            variant="ghost"
            onPress={() => {}}
            style={{ marginBottom: theme.spacing.md }}
          >
            Bouton Fantôme
          </Button>

          <Button
            disabled
            onPress={() => {}}
          >
            Bouton Désactivé
          </Button>
        </Card>

        {/* Input Showcase */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Champs de Saisie
          </AppText>

          <Input
            label="Email"
            placeholder="votre@email.com"
            value={inputValue}
            onChangeText={setInputValue}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <Input
            label="Mot de passe"
            placeholder="••••••••"
            secureTextEntry
            style={{ marginBottom: theme.spacing.lg }}
          />

          <Input
            label="Champ avec erreur"
            placeholder="Saisissez quelque chose"
            error="Ce champ est requis"
            style={{ marginBottom: theme.spacing.lg }}
          />

          <Input
            label="Champ avec aide"
            placeholder="Texte d'aide"
            helperText="Ceci est un texte d'aide pour l'utilisateur"
          />
        </Card>

        {/* Progress & Badges */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Progrès et Badges
          </AppText>

          <AppText variant="body" color="text" style={{ marginBottom: theme.spacing.sm }}>
            Progrès du cours (75%)
          </AppText>
          <ProgressBar
            progress={75}
            showLabel
            style={{ marginBottom: theme.spacing.lg }}
          />

          <AppText variant="body" color="text" style={{ marginBottom: theme.spacing.sm }}>
            Badges
          </AppText>
          <View style={styles.badgeRow}>
            <Badge variant="primary" style={{ marginRight: theme.spacing.sm }}>
              Formateur
            </Badge>
            <Badge variant="secondary" style={{ marginRight: theme.spacing.sm }}>
              Gratuit
            </Badge>
            <Badge variant="success" style={{ marginRight: theme.spacing.sm }}>
              Terminé
            </Badge>
            <Badge variant="warning">
              En cours
            </Badge>
          </View>

          <View style={[styles.badgeRow, { marginTop: theme.spacing.sm }]}>
            <Badge variant="error" style={{ marginRight: theme.spacing.sm }}>
              Erreur
            </Badge>
            <Badge variant="neutral" size="sm">
              Neutre
            </Badge>
          </View>
        </Card>

        {/* Color Palette */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Palette de Couleurs
          </AppText>

          <View style={styles.colorGrid}>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]} />
              <AppText variant="caption" color="text">Primary</AppText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.secondary }]} />
              <AppText variant="caption" color="text">Secondary</AppText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.success }]} />
              <AppText variant="caption" color="text">Success</AppText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.warning }]} />
              <AppText variant="caption" color="text">Warning</AppText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.error }]} />
              <AppText variant="caption" color="text">Error</AppText>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: theme.colors.surface }]} />
              <AppText variant="caption" color="text">Surface</AppText>
            </View>
          </View>
        </Card>

        {/* Course Card Example */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Exemple de Carte de Cours
          </AppText>

          <Card padding="lg" shadow="md">
            <View style={styles.courseHeader}>
              <View style={styles.courseImage}>
                <AppText variant="h2" color="textInverse">📚</AppText>
              </View>
              <View style={styles.courseInfo}>
                <AppText variant="h4" color="text">
                  Introduction au Développement Web
                </AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  par Jean Dupont
                </AppText>
                <Badge variant="success" size="sm" style={{ marginTop: theme.spacing.xs }}>
                  Débutant
                </Badge>
              </View>
            </View>

            <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.lg }}>
              Apprenez les bases du développement web avec HTML, CSS et JavaScript.
            </AppText>

            <View style={styles.courseFooter}>
              <AppText variant="caption" color="textLight">
                12 leçons • 3h 30min
              </AppText>
              <AppText variant="h4" color="primary">
                25,000 XAF
              </AppText>
            </View>
          </Card>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 32,
    paddingVertical: 20,
  },
  controlRow: {
    flexDirection: 'row',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#0070F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});
