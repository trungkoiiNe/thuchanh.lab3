import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  List,
  Avatar,

} from "react-native-paper";
import { Image } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const TransactionDetail = ({ route }) => {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [services, setServices] = useState([]);
  const [proofImageUrl, setProofImageUrl] = useState(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      const transactionDoc = await firestore()
        .collection("Transactions")
        .doc(transactionId)
        .get();
      if (transactionDoc.exists) {
        setTransaction(transactionDoc.data());

        const customerDoc = await firestore()
          .collection("UserLab3")
          .doc(transactionDoc.data().customer)
          .get();
        setCustomerName(
          customerDoc.data()?.fullName || customerDoc.data()?.email || "Unknown"
        );

        const adminDoc = await firestore()
          .collection("UserLab3")
          .doc(transactionDoc.data().admin)
          .get();
        setAdminName(
          adminDoc.data()?.fullName || adminDoc.data()?.email || "Unknown"
        );
        if (
          transactionDoc.data().paymentmethod === "banking" &&
          transactionDoc.data().proofImageUrl
        ) {
          setProofImageUrl(transactionDoc.data().proofImageUrl);
        }
        const servicesList = transactionDoc
          .data()
          .serviceslist.split(";")
          .map((s) => {
            const [id, quantity] = s.split(",");
            return { id, quantity: parseInt(quantity, 10) };
          });

        const servicesData = await Promise.all(
          servicesList.map(async ({ id, quantity }) => {
            const serviceDoc = await firestore()
              .collection("Services")
              .doc(id)
              .get();
            return {
              name: serviceDoc.data()?.name || "Unknown",
              price: serviceDoc.data()?.price || 0,
              quantity,
            };
          })
        );

        setServices(servicesData);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  if (!transaction) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.header}
      >
        <Title style={styles.headerTitle}>Transaction Details</Title>
        <Chip icon="cash" style={styles.statusChip}>
          {transaction.status}
        </Chip>
      </LinearGradient>

      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="Customer"
            description={customerName}
            left={(props) => <Avatar.Icon {...props} icon="account" />}
          />
          <Divider />
          <List.Item
            title="Admin"
            description={adminName}
            left={(props) => <Avatar.Icon {...props} icon="account-tie" />}
          />
          <Divider />
          <List.Item
            title="Bill Date"
            description={new Date(
              transaction.billDate.toDate()
            ).toLocaleString()}
            left={(props) => <Avatar.Icon {...props} icon="calendar" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Services</Title>
          {services.map((service, index) => (
            <List.Item
              key={index}
              title={service.name}
              description={`Quantity: ${service.quantity}`}
              right={() => (
                <Text style={styles.price}>
                  ${(service.price * service.quantity).toFixed(2)}
                </Text>
              )}
            />
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="Total Cost"
            right={() => (
              <Text style={styles.totalCost}>
                ${transaction.totalcost.toFixed(2)}
              </Text>
            )}
          />
          <Divider />
          <List.Item
            title="Discount"
            description={`${transaction.discount}%`}
            right={() => (
              <Text style={styles.discount}>
                -$
                {((transaction.totalcost * transaction.discount) / 100).toFixed(
                  2
                )}
              </Text>
            )}
          />
          <Divider />
          <List.Item
            title="Tax"
            description={`${transaction.tax}%`}
            right={() => (
              <Text style={styles.tax}>
                ${((transaction.totalcost * transaction.tax) / 100).toFixed(2)}
              </Text>
            )}
          />
          <Divider />
          <List.Item
            title="Total Cost after Tax and Discount"
            right={() => (
              <Text style={styles.totalCost}>
                ${transaction.totalcostaftertaxanddiscount.toFixed(2)}
              </Text>
            )}
          />
          <List.Item
            title="Payment Method"
            description={transaction.paymentmethod}
          />
          <Divider />
        </Card.Content>
      </Card>

      {transaction.note && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Note</Title>
            <Paragraph>{transaction.note}</Paragraph>
          </Card.Content>
        </Card>
      )}
      {transaction.paymentmethod === "banking" && proofImageUrl && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Payment Proof</Title>
            <Image
              source={{ uri: proofImageUrl }}
              style={{ width: 200, height: 200 }}
            />
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  statusChip: {
    marginTop: 10,
  },
  card: {
    margin: 10,
    elevation: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalCost: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  discount: {
    color: "#F44336",
  },
  tax: {
    color: "#2196F3",
  },
});

export default TransactionDetail;
