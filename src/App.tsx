import React from 'react';
import { StyleSheet } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; 

function App(): React.JSX.Element {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      region={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }}
    />
  );
}

const styles = StyleSheet.create({
 map: {
   ...StyleSheet.absoluteFillObject,
 },
});

export default App;
