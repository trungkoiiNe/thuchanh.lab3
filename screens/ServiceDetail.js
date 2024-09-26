import React, { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Title, Paragraph, Text } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

const ServiceDetail = ({ route }) => {
  const { serviceId } = route.params;
  const [service, setService] = React.useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchService = async () => {
        const serviceDoc = await firestore().collection("Services").doc(serviceId).get();
        if (serviceDoc.exists) {
          setService({ id: serviceDoc.id, ...serviceDoc.data() });
        }
      };
      fetchService();
    }, [serviceId])
  );

  const formattedTime = useMemo(() => {
    return service?.time?.toDate().toLocaleString() || '';
  }, [service?.time]);

  const formattedUpdateTime = useMemo(() => {
    return service?.finalUpdateTime?.toDate().toLocaleString() || '';
  }, [service?.finalUpdateTime]);

  if (!service) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{service.name}</Title>
          <Paragraph style={styles.price}>${service.price}</Paragraph>
          <InfoRow label="Creator" value={service.creator} />
          <InfoRow label="Created" value={formattedTime} />
          <InfoRow label="Last Updated" value={formattedUpdateTime} />
        </Card.Content>
      </Card>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoContainer}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

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

export default React.memo(ServiceDetail);
