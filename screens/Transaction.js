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
import { useMyContextController } from "../store";

const Transaction = ({ navigation }) => {
  const [controller, dispatch] = useMyContextController();
  const { userLogin, userEmail } = controller;
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
      const unsubscribe = TRANSACTIONS.onSnapshot(async (snapshot) => {
        setIsLoading(true);
        try {
          let transactionsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (userLogin.role === "customer") {
            transactionsList = transactionsList.filter(
              (transaction) => transaction.customer === userLogin.email
            );
          }

          setTransactions(transactionsList);

          // Fetch customer names (only needed for admin view)
          if (userLogin.role === "admin") {
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
                  userDoc.data()?.fullName ||
                    userDoc.data()?.email ||
                    "Unknown",
                ];
              })
            );
            setCustomerNames(Object.fromEntries(customerData));
          }
        } catch (error) {
          console.error("Error fetching transactions: ", error);
        } finally {
          setIsLoading(false);
        }
      });

      return () => unsubscribe();
    }, [userLogin])
  );

  const renderTransactionItem = useMemo(
    () =>
      ({ item }) =>
        (
          <TouchableOpacity onPress={() => handleTransactionPress(item.id)}>
            <Surface style={styles.card}>
              <View style={styles.cardContent}>
                <Avatar.Icon size={50} icon="cash" style={styles.avatar} />
                <View style={styles.transactionInfo}>
                  <Title style={styles.transactionName}>
                    {item.customer || "Loading..."}
                  </Title>
                  <Paragraph style={styles.transactionAmount}>
                    ${item.totalcostaftertaxanddiscount.toFixed(2)}
                  </Paragraph>
                  <Paragraph style={styles.transactionDate}>
                    {new Date(item.billDate.toDate()).toLocaleString()}
                  </Paragraph>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={24}
                  color="#4c669f"
                  style={styles.chevron}
                />
              </View>
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
          <View style={styles.header}>
            <Text style={styles.headerText}>Transactions List</Text>
            {/* <IconButton
              icon="plus-circle"
              color="#FF6B6B"
              size={40}
              onPress={() => navigation.navigate("AddNewService")}
            /> */}
          </View>
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
          {userLogin?.role === "admin" && (
            <FAB
              style={styles.fab}
              icon="plus"
              onPress={() => navigation.navigate("AddNewTransaction")}
            />
          )}
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
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "#ffffff",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    backgroundColor: "#4c669f",
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  transactionAmount: {
    fontSize: 16,
    color: "#4c669f",
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666666",
  },
  chevron: {
    marginLeft: "auto",
  },
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

export default Transaction;
