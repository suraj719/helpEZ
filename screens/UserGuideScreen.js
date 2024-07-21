import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const UserGuide = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const guideItems = [
    { id: 'home', title: t('Home Screen: Overview of features available on the home screen.') },
    { id: 'profile', title: t('Profile Setup: How to set up and manage your user profile.') },
    { id: 'language', title: t('Language Settings: How to switch between different languages.') },
    { id: 'report', title: t('Report Incident: Step-by-step guide on how to report an incident.') },
    { id: 'request', title: t('Request Help: Instructions on how to request help during emergencies.') },
    { id: 'volunteer', title: t('Volunteer Signup: How to sign up as a volunteer and manage activities.') },
    { id: 'notifications', title: t('Notifications: Explanation of the notification system and how to manage notifications.') },
    { id: 'location', title: t('How to enable location services for better assistance and reporting accuracy.') },
    { id: 'offline', title: t('How to use the app offline using mesh networking.') },
    { id: 'safety', title: t('General safety tips for different types of disasters (e.g., earthquakes, floods).') },
    { id: 'faqs', title: t('Answers to frequently asked questions about using the app and its features.') },
    { id: 'support', title: t('How to get in touch with customer support for further assistance.') },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('User Guide')}</Text>

      <Section title={t('Introduction')}>
        <Text style={styles.text}>{t('Welcome to HelpEZ! This app helps you manage disaster situations effectively by providing real-time information and assistance.')}</Text>
      </Section>

      <Section title={t('Navigation and Basic Usage')}>
        {guideItems.slice(0, 3).map(item => (
          <GuideCard key={item.id} item={item} />
        ))}
      </Section>

      <Section title={t('Key Features')}>
        {guideItems.slice(3, 7).map(item => (
          <GuideCard key={item.id} item={item} />
        ))}
      </Section>

      <Section title={t('Location Services')}>
        {guideItems.slice(7, 8).map(item => (
          <GuideCard key={item.id} item={item} />
        ))}
      </Section>

      <Section title={t('Offline Usage')}>
        {guideItems.slice(8, 9).map(item => (
          <GuideCard key={item.id} item={item} />
        ))}
      </Section>

      <Section title={t('Safety Tips')}>
        {guideItems.slice(9, 10).map(item => (
          <GuideCard key={item.id} item={item} />
        ))}
      </Section>

      <Section title={t('FAQs')}>
        {guideItems.slice(10, 11).map(item => (
          <GuideCard key={item.id} item={item} />
        ))}
      </Section>

      <Section title={t('Support')}>
        {guideItems.slice(11, 12).map(item => (
          <GuideCard key={item.id} item={item} />
        ))}
      </Section>
    </ScrollView>
  );
};

const GuideCard = ({ item }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('GuideDetail', { itemId: item.id })}
    >
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  card: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default UserGuide;
