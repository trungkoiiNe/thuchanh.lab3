import React, { useState, useEffect,useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';

import { View, FlatList, StyleSheet } from "react-native";
import { Text, IconButton, Card, Title, Paragraph } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";

const Services = ({ navigation,route }) => {
  const [services, setServices] = useState([]);
  const SERVICES = firestore().collection("Services");
  const handleServicePress = (serviceData) => {
    console.log(serviceData);
    navigation.navigate("ServiceDetail", { serviceId:serviceData });
  };
  useFocusEffect(
    useCallback(() => {
      const fetchServices = async () => {
        const snapshot = await firestore().collection("Services").get();
        const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesList);
      };
      fetchServices();
    }, [])
  );
  useEffect(() => {
    const unsubscribe = SERVICES.onSnapshot((snapshot) => {
      const servicesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesList);
    });

    return () => unsubscribe();
  }, []);

  const renderServiceItem = ({ item }) => (
    <Card style={styles.card} onPress={() => handleServicePress(item.id)}>
      <Card.Content>
        <Title style={styles.serviceName}>{item.name}</Title>
        <Paragraph style={styles.servicePrice}>${item.price}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Services List</Text>
        <IconButton
          icon="plus-circle"
          color="#FF6B6B"
          size={40}
          onPress={() => navigation.navigate("AddNewService")}
        />
      </View>
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#4ECDC4",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#45B7D1",
  },
  servicePrice: {
    fontSize: 16,
    color: "#FF6B6B",
    marginTop: 8,
  },
});

export default Services;
