import React, { useState, useEffect } from 'react';
import { Alert, View } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const EditService = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const SERVICES = firestore().collection("Services");

  useEffect(() => {
    const fetchService = async () => {
      const serviceDoc = await SERVICES.doc(serviceId).get();
      if (serviceDoc.exists) {
        const serviceData = serviceDoc.data();
        setName(serviceData.name);
        setPrice(serviceData.price.toString());
      }
    };
    fetchService();
  }, [serviceId]);

  const handlePriceChange = (text) => {
    const cleanedText = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    if (cleanedText.startsWith('.')) {
      setPrice('0' + cleanedText);
    } else {
      setPrice(cleanedText);
    }
  };

  const updateService = async () => {
    const userLogin = auth().currentUser;
    const now = firestore.Timestamp.now();

    const cleanedPrice = price.replace(/[^0-9.]/g, '');
    if (isNaN(cleanedPrice) || parseFloat(cleanedPrice) < 0) {
      Alert.alert('Error', 'Please enter a valid positive number for the price.');
      return;
    }

    try {
      await SERVICES.doc(serviceId).update({
        name: name,
        price: parseFloat(cleanedPrice),
        finalUpdateTime: now
      });
      Alert.alert('Success', 'Service updated successfully');
      // Navigate back to the previous screen and refresh servicedetail
      // navigation.goBack();
      navigation.navigate('ServiceDetail', { serviceId });
    } catch (error) {
      console.error('Error updating service: ', error);
      Alert.alert('Error', 'Failed to update service. Please try again.');
    }
  };

  return (
    <View>
      <Text>Edit Service</Text>
      <TextInput
        label="Service Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        label="Price"
        value={price}
        onChangeText={handlePriceChange}
        keyboardType="numeric"
      />
      <Button mode="contained" onPress={updateService}>
        Update Service
      </Button>
    </View>
  );
};

export default EditService;
