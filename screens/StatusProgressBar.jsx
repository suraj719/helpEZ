// StatusProgressBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const statuses = ['Started', 'Dispatched', 'Nearby', 'Out for Delivery'];

const StatusProgressBar = ({ currentStatus }) => {
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {statuses.map((status, index) => (
        <React.Fragment key={status}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.circle,
              index <= currentIndex ? styles.activeCircle : {}
            ]}>
              <Text style={[
                styles.circleText,
                index <= currentIndex ? styles.activeCircleText : {}
              ]}>{index + 1}</Text>
            </View>
            <Text style={[
              styles.statusText,
              index <= currentIndex ? styles.activeText : {}
            ]}>{status}</Text>
          </View>
          {index < statuses.length - 1 && (
            <View style={[
              styles.line,
              index < currentIndex ? styles.activeLine : {}
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#4CAF50',
  },
  circleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  activeCircleText: {
    color: '#fff',
  },
  line: {
    flex: 1,
    height: 2.5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  activeLine: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
  },
  activeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default StatusProgressBar;