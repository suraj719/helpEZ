import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const GuideDetail = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const { itemId } = route.params;

  const guideDetails = {
    home: t('Overview of features available on the home screen.'),
    profile: t('How to set up and manage your user profile.'),
    language: t('How to switch between different languages.'),
    report: t('Step-by-step guide on how to report an incident.'),
    request: t('Instructions on how to request help during emergencies.'),
    volunteer: t('How to sign up as a volunteer and manage activities.'),
    notifications: t('Explanation of the notification system and how to manage notifications.'),
    location: t('How to enable location services for better assistance and reporting accuracy.'),
    offline: t('How to use the app offline using mesh networking.'),
    safety: t('General safety tips for different types of disasters (e.g., earthquakes, floods).'),
    faqs: t('Answers to frequently asked questions about using the app and its features.'),
    support: t('How to get in touch with customer support for further assistance.'),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('Guide Detail')}</Text>
      <Text style={styles.detailText}>{guideDetails[itemId]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default GuideDetail;
