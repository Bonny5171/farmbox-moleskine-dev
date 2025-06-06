import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App(): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [annotations, setAnnotations] = useState<any[]>([]); // Lista de anotações

  useEffect(() => {
    loadAnnotations();
  }, []);

  const loadAnnotations = async () => {
    try {
      const data = await AsyncStorage.getItem('annotations');
      if (data) {
        setAnnotations(JSON.parse(data));
      }
    } catch (err) {
      console.warn('Erro ao carregar anotações:', err);
    }
  };

  const handleSave = () => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toISOString();

        const newNote = {
          text: annotationText,
          latitude,
          longitude,
          timestamp,
        };

        try {
          const updatedAnnotations = [...annotations, newNote];
          await AsyncStorage.setItem('annotations', JSON.stringify(updatedAnnotations));

          console.log('<><<<<<', JSON.stringify(updatedAnnotations))
          setAnnotations(updatedAnnotations); // Atualiza o estado com a nova lista

          setModalVisible(false);
          Alert.alert('Anotação salva!');
          setAnnotationText('');
        } catch (error) {
          Alert.alert('Erro ao salvar anotação');
        }
      },
      error => {
        Alert.alert('Erro ao obter localização', error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  };
console.log('annotations', annotations)
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: -23.663747891698005,
          longitude: -46.77334002846742,
          latitudeDelta: 50,
          longitudeDelta: 50,
        }}
      >
        {annotations.map((note, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: note.latitude,
              longitude: note.longitude,
            }}
            title={`Anotação ${index + 1}`}
            description={`${note.text}\n${new Date(note.timestamp).toLocaleString()}`}
          />
        ))}
      </MapView>

      <View style={styles.floatingButtonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={loadAnnotations}>
          <Text style={styles.buttonText}>Sincronizar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Anotação</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Digite sua anotação..."
              value={annotationText}
              onChangeText={setAnnotationText}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: 'gray' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    gap: 10,
    flexDirection: 'column',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  textInput: {
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    textAlignVertical: 'top',
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default App;
