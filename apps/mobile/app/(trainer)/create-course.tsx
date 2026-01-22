import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function CreateCourseScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  });
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Développement Web',
    'Mobile',
    'Design',
    'Marketing',
    'Business',
    'Langues',
    'Sciences',
    'Arts',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setThumbnail(result.assets[0].uri);
    }
  };

  const uploadThumbnail = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `course-thumbnails/${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('course-assets')
        .upload(fileName, blob);

      if (error) {
        console.error('Error uploading thumbnail:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('course-assets')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!formData.title || !formData.description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      let thumbnailUrl = null;
      if (thumbnail) {
        thumbnailUrl = await uploadThumbnail(thumbnail);
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          trainer_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          category: formData.category,
          level: formData.level,
          thumbnail_url: thumbnailUrl,
          is_published: false,
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Erreur', 'Impossible de créer le cours');
        console.error('Error creating course:', error);
      } else {
        Alert.alert('Succès', 'Cours créé avec succès!', [
          {
            text: 'OK',
            onPress: () => router.push(`/(trainer)/course/${data.id}`),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
      console.error('Error creating course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <AppText variant="h2" color="text">
            {t('course.createCourse')}
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
            Créez un nouveau cours pour vos étudiants
          </AppText>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Titre du cours *"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Ex: Introduction au développement web"
            style={{ marginBottom: theme.spacing.lg }}
          />

          <Input
            label="Description *"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Décrivez votre cours en détail..."
            multiline
            numberOfLines={4}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <Input
            label="Prix (XAF)"
            value={formData.price}
            onChangeText={(value) => handleInputChange('price', value)}
            placeholder="0 pour gratuit"
            keyboardType="numeric"
            style={{ marginBottom: theme.spacing.lg }}
          />

          <View style={{ marginBottom: theme.spacing.lg }}>
            <AppText variant="bodySmall" color="text" style={{ marginBottom: theme.spacing.xs }}>
              Catégorie
            </AppText>
            <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                style={{ color: theme.colors.text }}
              >
                <Picker.Item label="Sélectionner une catégorie" value="" />
                {categories.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={{ marginBottom: theme.spacing.lg }}>
            <AppText variant="bodySmall" color="text" style={{ marginBottom: theme.spacing.xs }}>
              Niveau
            </AppText>
            <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
              <Picker
                selectedValue={formData.level}
                onValueChange={(value) => handleInputChange('level', value)}
                style={{ color: theme.colors.text }}
              >
                <Picker.Item label={t('course.beginner')} value="beginner" />
                <Picker.Item label={t('course.intermediate')} value="intermediate" />
                <Picker.Item label={t('course.advanced')} value="advanced" />
              </Picker>
            </View>
          </View>

          <View style={{ marginBottom: theme.spacing.lg }}>
            <AppText variant="bodySmall" color="text" style={{ marginBottom: theme.spacing.xs }}>
              Image de couverture
            </AppText>
            <Button
              variant="outline"
              onPress={pickThumbnail}
              style={{ marginBottom: theme.spacing.sm }}
            >
              {thumbnail ? 'Changer l\'image' : 'Choisir une image'}
            </Button>
            {thumbnail && (
              <AppText variant="caption" color="success">
                Image sélectionnée
              </AppText>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              variant="outline"
              onPress={() => router.back()}
              style={{ flex: 1, marginRight: theme.spacing.sm }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onPress={handleSubmit}
              loading={loading}
              style={{ flex: 1, marginLeft: theme.spacing.sm }}
            >
              Créer le cours
            </Button>
          </View>
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
    marginBottom: 24,
  },
  formCard: {
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
  },
});
