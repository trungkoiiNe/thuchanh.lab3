import React, { useState } from 'react';
import { Alert, View } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const AddNewService = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const SERVICES = firestore().collection("Services");

  const addService = async () => {
    const userLogin = auth().currentUser;
    const now = firestore.Timestamp.now();
    const handlePriceChange = (text) => {
      // Remove any non-digit characters except for the first decimal point
      const cleanedText = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');

      // Ensure the decimal point is not the first character
      if (cleanedText.startsWith('.')) {
        setPrice('0' + cleanedText);
      } else {
        setPrice(cleanedText);
      }
    };
    // Check for duplicate name
    const snapshot = await SERVICES.where('name', '==', name).get();
    if (!snapshot.empty) {
      Alert.alert('Error', 'A service with this name already exists.');
      return;
    }

    // Validate price
    const cleanedPrice = price.replace(/[^0-9.]/g, '');
    if (isNaN(cleanedPrice) || parseFloat(cleanedPrice) < 0) {
      Alert.alert('Error', 'Please enter a valid positive number for the price.');
      return;
    }

    try {
      await SERVICES.add({
        name: name,
        price: parseFloat(cleanedPrice),
        creator: userLogin.displayName || userLogin.email,
        time: now,
        finalUpdateTime: now
      });
      Alert.alert('Success', 'Service added successfully');
      setName('');
      setPrice('');
    } catch (error) {
      console.error('Error adding service: ', error);
      Alert.alert('Error', 'Failed to add service. Please try again.');
    }
  };

  return (
    <View>
      <Text>Add New Service</Text>
      <TextInput
        label="Service Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        label="Price"
        value={price}
        onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"



      />
      <Button mode="contained" onPress={addService}>
        Add Service
      </Button>
    </View>
  );
};

export default AddNewService;
