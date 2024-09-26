import React, { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import {
  Text,
  Card,
  Title,
  Paragraph,
  FAB,
  Avatar,
  Surface,
  IconButton,
} from "react-native-paper";
import Loading from "../components/Loading";
import firestore from "@react-native-firebase/firestore";

const Transaction = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [customerNames, setCustomerNames] = useState({});
  const TRANSACTIONS = firestore().collection("Transactions");
  const [isLoading, setIsLoading] = useState(true);

  const handleTransactionPress = (transactionData) => {
    navigation.navigate("TransactionDetail", {
      transactionId: transactionData,
    });
  };

  useFocusEffect(
    useCallback(() => {
      const fetchTransactions = async () => {
        setIsLoading(true);
        try {
          const snapshot = await TRANSACTIONS.get();
          const transactionsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTransactions(transactionsList);

          // Fetch customer names
          const customerIds = transactionsList.map((t) => t.customer);
          const uniqueCustomerIds = [...new Set(customerIds)];
          const customerData = await Promise.all(
            uniqueCustomerIds.map(async (id) => {
              const userDoc = await firestore()
                .collection("UserLab3")
                .doc(id)
                .get();
              return [
                id,
                userDoc.data()?.fullName || userDoc.data()?.email || "Unknown",
              ];
            })
          );
          setCustomerNames(Object.fromEntries(customerData));
        } catch (error) {
          console.error("Error fetching transactions: ", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransactions();
    }, [])
  );
  const renderTransactionItem = useMemo(
    () =>
      ({ item }) =>
        (
          <TouchableOpacity onPress={() => handleTransactionPress(item.id)}>
            <Surface style={styles.card}>
              <Avatar.Icon size={40} icon="cash" style={styles.avatar} />
              <Title style={styles.transactionName}>
                {customerNames[item.customer] || "Loading..."}
              </Title>
              <Paragraph style={styles.transactionAmount}>
                $
                {
                  item.totalcost
                  // .toFixed(2)
                }
              </Paragraph>
            </Surface>
          </TouchableOpacity>
        ),
    [customerNames, handleTransactionPress]
  );

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerText}>Services List</Text>
        <IconButton
          icon="plus-circle"
          color="#FF6B6B"
          size={40}
          onPress={() => navigation.navigate("AddNewService")}
        />
      </View> */}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => navigation.navigate("AddNewTransaction")}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "#4c669f",
  },
  avatar: {
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  transactionName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 18,
    color: "#FFD700",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#4ECDC4",
  },
});

export default Transaction;
