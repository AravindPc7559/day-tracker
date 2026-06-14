import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const useCameraCapture = () => {
  const openCamera = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to capture bills.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  return { openCamera };
};
