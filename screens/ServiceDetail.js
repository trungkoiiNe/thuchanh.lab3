import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { View, StyleSheet } from "react-native";
import { Card, Title, Paragraph, Text } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";

const ServiceDetail = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [creator, setCreator] = useState("");
  const [finalUpdateTime, setFinalUpdateTime] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState(null);

  // console.log(service)
  const SERVICES = firestore().collection("Services");
  //get specified service data from firestore using service id
  // const serviceData=null;
  useEffect(() => {
    const fetchService = async () => {
      const serviceDoc = await SERVICES.doc(serviceId).get();
      if (serviceDoc.exists) {
        const serviceData = serviceDoc.data();
        setName(serviceData.name);
        setPrice(serviceData.price.toString());
        setCreator(serviceData.creator);
        setFinalUpdateTime(serviceData.finalUpdateTime.toDate().toLocaleString());
        setTime(serviceData.time.toDate().toLocaleString());
      }
    };
    fetchService();
  }, [serviceId]);
  useFocusEffect(
    useCallback(() => {
      const fetchService = async () => {
        const serviceDoc = await firestore().collection("Services").doc(serviceId).get();
        if (serviceDoc.exists) {
          setServices({ id: serviceDoc.id, ...serviceDoc.data() });
        }
      };
      fetchService();
    }, [serviceId])
  );
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{name}</Title>
          <Paragraph style={styles.price}>${price}</Paragraph>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Creator:</Text>
            <Text style={styles.value}>{creator}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>
              {time}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>
              {finalUpdateTime}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F0F4F8",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: "#4CAF50",
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#3F51B5",
    width: 100,
  },
  value: {
    flex: 1,
    color: "#424242",
  },
});

export default ServiceDetail;
