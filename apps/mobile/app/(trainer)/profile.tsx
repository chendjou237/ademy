import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Badge, Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function TrainerProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const { profile, signOut, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState(profile?.mobile_money_provider || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile({
      full_name: fullName,
      bio: bio,
      phone_number: phoneNumber,
      mobile_money_provider: mobileMoneyProvider,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } else {
      setEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'fr' ? 'en' : 'fr';
    setLocale(newLocale);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <AppText variant="h2" color="text">
            {t('nav.profile')}
          </AppText>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <AppText variant="h2" color="textInverse">
                {profile?.full_name?.charAt(0).toUpperCase() || 'T'}
              </AppText>
            </View>
            <View style={styles.profileInfo}>
              <AppText variant="h3" color="text">
                {profile?.full_name || 'Formateur'}
              </AppText>
              <AppText variant="body" color="textSecondary">
                {profile?.email}
              </AppText>
              <Badge variant="primary" size="sm" style={{ marginTop: theme.spacing.xs }}>
                Formateur
              </Badge>
            </View>
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <Input
                label={t('auth.fullName')}
                value={fullName}
                onChangeText={setFullName}
                style={{ marginBottom: theme.spacing.lg }}
              />
              <Input
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={{ marginBottom: theme.spacing.lg }}
              />
              <Input
                label="Numéro de téléphone"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Ex: +237 6XX XXX XXX"
                keyboardType="phone-pad"
                style={{ marginBottom: theme.spacing.lg }}
              />
              <Input
                label="Opérateur Mobile Money"
                value={mobileMoneyProvider}
                onChangeText={setMobileMoneyProvider}
                placeholder="Ex: Orange Money, MTN MoMo"
                style={{ marginBottom: theme.spacing.lg }}
              />
              <View style={styles.editActions}>
                <Button
                  variant="outline"
                  onPress={() => setEditing(false)}
                  style={{ flex: 1, marginRight: theme.spacing.sm }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onPress={handleSave}
                  loading={loading}
                  style={{ flex: 1, marginLeft: theme.spacing.sm }}
                >
                  {t('common.save')}
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.profileDetails}>
              {profile?.bio && (
                <View style={{ marginTop: theme.spacing.lg }}>
                  <AppText variant="bodySmall" color="textSecondary">Bio</AppText>
                  <AppText variant="body" color="text" style={{ marginTop: theme.spacing.xs }}>
                    {profile.bio}
                  </AppText>
                </View>
              )}

              {profile?.phone_number && (
                <View style={{ marginTop: theme.spacing.lg }}>
                  <AppText variant="bodySmall" color="textSecondary">Téléphone</AppText>
                  <AppText variant="body" color="text" style={{ marginTop: theme.spacing.xs }}>
                    {profile.phone_number}
                  </AppText>
                </View>
              )}

              {profile?.mobile_money_provider && (
                <View style={{ marginTop: theme.spacing.lg }}>
                  <AppText variant="bodySmall" color="textSecondary">Mobile Money</AppText>
                  <AppText variant="body" color="text" style={{ marginTop: theme.spacing.xs }}>
                    {profile.mobile_money_provider}
                  </AppText>
                </View>
              )}

              <Button
                variant="outline"
                onPress={() => setEditing(true)}
                style={{ marginTop: theme.spacing.lg }}
              >
                {t('common.edit')}
              </Button>
            </View>
          )}
        </Card>

        <Card style={styles.paymentCard}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Informations de Paiement
          </AppText>

          <View style={styles.paymentInfo}>
            <AppText variant="body" color="text">
              Numéro Mobile Money: {profile?.phone_number || 'Non configuré'}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
              Opérateur: {profile?.mobile_money_provider || 'Non spécifié'}
            </AppText>
          </View>

          <AppText variant="bodySmall" color="textLight" style={{ marginTop: theme.spacing.md }}>
            Les paiements sont effectués via Mobile Money. Assurez-vous que vos informations sont correctes.
          </AppText>
        </Card>

        <Card style={styles.settingsCard}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Paramètres
          </AppText>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AppText variant="body" color="text">Mode Sombre</AppText>
              <AppText variant="bodySmall" color="textSecondary">
                Activer le thème sombre
              </AppText>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AppText variant="body" color="text">Langue</AppText>
              <AppText variant="bodySmall" color="textSecondary">
                {locale === 'fr' ? 'Français' : 'English'}
              </AppText>
            </View>
            <Button
              variant="outline"
              onPress={toggleLanguage}
              style={{ paddingHorizontal: theme.spacing.lg }}
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </Button>
          </View>
        </Card>

        <Button
          variant="outline"
          onPress={handleSignOut}
          style={[styles.signOutButton, { borderColor: theme.colors.error }]}
        >
          <AppText variant="button" color="error">
            {t('auth.signOut')}
          </AppText>
        </Button>
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
    marginBottom: 24,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0070F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileDetails: {
    marginTop: 16,
  },
  editForm: {
    marginTop: 16,
  },
  editActions: {
    flexDirection: 'row',
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentInfo: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
  },
  signOutButton: {
    marginBottom: 20,
  },
});
