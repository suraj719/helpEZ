import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileContainer}>
        <Image
          style={styles.profileImage}
          source={{ uri: 'https://cdn.usegalileo.ai/stability/563e97b1-3c37-4960-af0c-ed843bb03196.png' }}
        />
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>Maria</Text>
          <Text style={styles.profileJoined}>Joined in 2020</Text>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {['Volunteer', 'Community', 'Healthcare', 'Firefighter'].map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Safety</Text>
      <TouchableOpacity style={styles.listItem}>
        <View style={styles.listItemTextContainer}>
          <Text style={styles.listItemTitle}>Report incident</Text>
          <Text style={styles.listItemSubtitle}>Report an incident to your community</Text>
        </View>
        <ArrowRightIcon />
      </TouchableOpacity>

      <TouchableOpacity style={styles.listItem}>
        <View style={styles.listItemTextContainer}>
          <Text style={styles.listItemTitle}>Tasks</Text>
          <Text style={styles.listItemSubtitle}>Find volunteer tasks nearby</Text>
        </View>
        <ArrowRightIcon />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Bio</Text>
      <Text style={styles.bioText}>
        I'm a nurse and I love to help people. I've been working in the healthcare industry for 3 years.
      </Text>

      <Text style={styles.sectionTitle}>Alerts</Text>
      <View style={styles.alertContainer}>
        <Image
          style={styles.alertImage}
          source={{ uri: 'https://cdn.usegalileo.ai/stability/24a9eb8d-81e5-4bd3-a0a1-a2021abef114.png' }}
        />
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>Santa Clara County</Text>
          <Text style={styles.alertSubtitle}>2 days ago</Text>
          <Text style={styles.alertSubtitle}>Flood warning</Text>
        </View>
      </View>

      <View style={styles.alertContainer}>
        <Image
          style={styles.alertImage}
          source={{ uri: 'https://cdn.usegalileo.ai/stability/e842a9d1-6423-4bb5-af41-c07db34c24a2.png' }}
        />
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>San Jose</Text>
          <Text style={styles.alertSubtitle}>1 month ago</Text>
          <Text style={styles.alertSubtitle}>COVID-19 testing site</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const ArrowLeftIcon = () => (
    <SvgXml
      xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
      </svg>`}
      width="24"
      height="24"
    />
  );
  
  const ArrowRightIcon = () => (
    <SvgXml
      xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
      </svg>`}
      width="24"
      height="24"
    />
  );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8f8',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#e0e0e0',
  },
  profileTextContainer: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b0f0e',
  },
  profileJoined: {
    fontSize: 16,
    color: '#97534e',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 16,
  },
  tag: {
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3e8e7',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#1b0f0e',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b0f0e',
    marginVertical: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b0f0e',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#97534e',
  },
  bioText: {
    fontSize: 16,
    color: '#1b0f0e',
    paddingVertical: 16,
  },
  alertContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  alertImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b0f0e',
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#97534e',
  },
  footer: {
    paddingVertical: 16,
  },
  followButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d72619',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fcf8f8',
  },
});
