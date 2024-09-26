import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Surface,
  IconButton,
  // Colors,
} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
const Colors = {
  blue500: "#2196F3",
  blue800: "#1565C0",
  green500: "#4CAF50",
};
const AddNewService = ({ navigation }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const SERVICES = firestore().collection("Services");

  const addService = async () => {
    const userLogin = auth().currentUser;
    const now = firestore.Timestamp.now();

    const cleanedPrice = price.replace(/[^0-9.]/g, "");
    if (isNaN(cleanedPrice) || parseFloat(cleanedPrice) < 0) {
      alert("Please enter a valid positive number for the price.");
      return;
    }

    try {
      await SERVICES.add({
        name: name,
        price: parseFloat(cleanedPrice),
        creator: userLogin.displayName || userLogin.email,
        time: now,
        finalUpdateTime: now,
      });
      alert("Service added successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding service: ", error);
      alert("Failed to add service. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Add New Service</Text>
        <TextInput
          label="Service Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: Colors.blue500 } }}
        />
        <TextInput
          label="Price"
          value={price}
          onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ""))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: Colors.blue500 } }}
          left={<TextInput.Affix text="$" />}
        />
        <Button
          mode="contained"
          onPress={addService}
          style={styles.button}
          icon="plus-circle"
        >
          Add Service
        </Button>
      </Surface>
      <IconButton
        icon="arrow-left"
        color={Colors.blue500}
        size={30}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.blue800,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: Colors.green500,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
  },
});

export default AddNewService;
