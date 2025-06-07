import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Dimensions, TouchableOpacity,
  Modal, Text, TextInput, PermissionsAndroid, Platform, Alert
} from 'react-native';
import Mapbox, { Logger } from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

Logger.setLogCallback((log): boolean => {
  const { message } = log;
  return message.match('Request failed due to a permanent error') ? true : false;
});

Mapbox.setAccessToken('sk.eyJ1IjoiaWJvbm55IiwiYSI6ImNtYmxqMnRkNTEzOXkybHB5bXF4ZTZ2bWsifQ.RojF7d8mbQN6MkNfQ7AyUA');
Mapbox.setTelemetryEnabled(false);

const App = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);
  
  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem('notes');
      const parsed = stored ? JSON.parse(stored) : [];
      console.log('>>>>> notes', parsed)
      setNotes(parsed);
    } catch (e) {
      console.error('Erro ao carregar anotações:', e);
    }
  };

  const openAddModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setNoteText('');
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permissão de Localização',
        message: 'Precisamos acessar sua localização para registrar a anotação.',
        buttonPositive: 'OK',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const saveNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Erro', 'Digite uma anotação antes de salvar.');
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permissão negada', 'Não foi possível acessar a localização.');
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toISOString();

        const newNote = {
          text: noteText.trim(),
          latitude,
          longitude,
          timestamp,
        };

        try {
          const stored = await AsyncStorage.getItem('notes');
          const notes = stored ? JSON.parse(stored) : [];
          notes.push(newNote);
          console.log(notes);
          await AsyncStorage.setItem('notes', JSON.stringify(notes));
          Alert.alert('Sucesso', 'Anotação salva com sucesso!');
          closeModal();
        } catch (e) {
          Alert.alert('Erro', 'Não foi possível salvar a anotação.');
        }
      },
      error => {
        Alert.alert('Erro de localização', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const onMarkerPress = note => {
    // setSelectedNote(note);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        zoomEnabled
        styleURL='mapbox://styles/mapbox/outdoors-v12'
        rotateEnabled
      >
        <Mapbox.Camera
          zoomLevel={15}
          centerCoordinate={[-46.6333, -23.5505]}
          pitch={60}
          animationMode='flyTo'
          animationDuration={6000}
        />

        {notes.map(note => (
          <Mapbox.PointAnnotation
            key={note.text}
            id={note.text}
            coordinate={[note.latitude, note.longitude]}
            onSelected={() => onMarkerPress(note)}
          >
            
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* Botões flutuantes */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={openAddModal} style={styles.fab}>
          <Text style={styles.fabText}>Adicionar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.fab}>
          <Text style={styles.fabText}>Sincronizar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para adicionar ou visualizar */}
      <Modal visible={modalVisible} animationType='fade' transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={closeModal} style={styles.closeBotton}>
              <Text style={styles.closeBottonText}>fechar</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Digite sua anotação:</Text>
            <TextInput
              multiline
              placeholder="Escreva aqui..."
              style={styles.textArea}
              value={noteText}
              onChangeText={setNoteText}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { height: '100%', width: '100%' },
  map: { flex: 1 },
  buttonsContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    gap: 12,
  },
  fab: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    elevation: 4,
  },
  fabText: { color: 'white', fontWeight: 'bold' },
  modalContainer: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white', borderRadius: 16,
    padding: 20, elevation: 6,
    width: Dimensions.get('window').width - 40,
  },
  closeBotton: { position: 'absolute', top: 16, right: 16, },
  closeBottonText: { color: 'black', fontSize: 18 },
  label: { fontSize: 16, marginBottom: 8 },
  textArea: {
    minHeight: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#28a745',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
});
