import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Surface,
  IconButton,
  Checkbox,
  RadioButton,
  Menu,
  List,
  Divider,
} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Loading from "../components/Loading";
const AddNewTransaction = ({ navigation }) => {
  const [customer, setCustomer] = useState("");
  const [status, setStatus] = useState("not paid");
  const [discount, setDiscount] = useState("0");
  const [paymentmethod, setPaymentMethod] = useState("");
  const [tax, setTax] = useState("0");
  const [note, setNote] = useState("");

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [visible, setVisible] = useState(false);

  const TRANSACTIONS = firestore().collection("Transactions");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchCustomersAndServices = async () => {
      setIsLoading(true);
      try {
        const customersSnapshot = await firestore()
          .collection("UserLab3")
          .get();
        const servicesSnapshot = await firestore().collection("Services").get();
        setCustomers(
          customersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setServices(
          servicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomersAndServices();
  }, []);
  const handleDiscountChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setDiscount(numericValue);
  };

  const handleTaxChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setTax(numericValue);
  };

  const addService = (service) => {
    const existingService = selectedServices.find((s) => s.id === service.id);
    if (existingService) {
      setSelectedServices(
        selectedServices.map((s) =>
          s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
  };

  const updateQuantity = (serviceId, newQuantity) => {
    if (newQuantity < 1) {
      removeService(serviceId);
    } else {
      setSelectedServices(
        selectedServices.map((s) =>
          s.id === serviceId ? { ...s, quantity: newQuantity } : s
        )
      );
    }
  };

  const calculateTotalCost = () => {
    const subtotal = selectedServices.reduce(
      (total, service) => total + service.price * service.quantity,
      0
    );
    const taxAmount = subtotal * (parseFloat(tax) / 100);
    const discountAmount = subtotal * (parseFloat(discount) / 100);
    return subtotal + taxAmount - discountAmount;
  };

  const addTransaction = async () => {
    const admin = auth().currentUser;
    const now = firestore.Timestamp.now();
    const totalcost = calculateTotalCost();
    // const totalcostafterdiscount =
    //   totalcost - totalcost * (parseFloat(discount) / 100);

    try {
      await TRANSACTIONS.add({
        customer,
        admin: admin.uid,
        serviceslist: selectedServices
          .map((s) => `${s.id},${s.quantity}`)
          .join(";"),
        billDate: now,
        status,
        totalcost,
        discount: parseFloat(discount),
        // totalcostafterdiscount,
        paymentmethod,
        tax: parseFloat(tax),
        note,
      });
      alert("Transaction added successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding transaction: ", error);
      alert("Failed to add transaction. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface}>
        <Text style={styles.title}>Add New Transaction</Text>

        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <Button onPress={() => setVisible(true)}>Select Customer</Button>
          }
        >
          {customers.map((c) => (
            <Menu.Item
              key={c.id}
              onPress={() => {
                setCustomer(c.id);
                setVisible(false);
              }}
              title={c.fullName || c.email}
            />
          ))}
        </Menu>

        <Text style={styles.sectionTitle}>Available Services</Text>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <ScrollView style={styles.servicesList}>
              {services.map((service) => (
                <List.Item
                  key={service.id}
                  title={service.name}
                  description={`$${service.price.toFixed(2)}`}
                  right={() => (
                    <IconButton
                      icon="plus"
                      onPress={() => addService(service)}
                    />
                  )}
                />
              ))}
            </ScrollView>
          </>
        )}

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Selected Services</Text>
        {selectedServices.map((service) => (
          <View key={service.id} style={styles.selectedService}>
            <Text>
              {service.name} - ${service.price.toFixed(2)}
            </Text>
            <View style={styles.quantityControl}>
              <IconButton
                icon="minus"
                onPress={() => updateQuantity(service.id, service.quantity - 1)}
              />
              <Text>{service.quantity}</Text>
              <IconButton
                icon="plus"
                onPress={() => updateQuantity(service.id, service.quantity + 1)}
              />
            </View>
          </View>
        ))}

        <Text style={styles.totalCost}>
          Total Cost: ${calculateTotalCost().toFixed(2)}
        </Text>

        <RadioButton.Group
          onValueChange={(value) => setStatus(value)}
          value={status}
        >
          <View style={styles.radioGroup}>
            <RadioButton.Item label="Paid" value="paid" />
            <RadioButton.Item label="Not Paid" value="not paid" />
          </View>
        </RadioButton.Group>

        <TextInput
          label="Discount (%)"
          value={discount}
          onChangeText={handleDiscountChange}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <RadioButton.Group
          onValueChange={(value) => setPaymentMethod(value)}
          value={paymentmethod}
        >
          <View style={styles.radioGroup}>
            <RadioButton.Item label="Debit" value="debit" />
            <RadioButton.Item label="Cash" value="cash" />
            <RadioButton.Item label="Banking" value="banking" />
          </View>
        </RadioButton.Group>

        <TextInput
          label="Tax (%)"
          value={tax}
          onChangeText={handleTaxChange}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Note"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          style={styles.input}
          multiline
        />

        <Button mode="contained" onPress={addTransaction} style={styles.button}>
          Add Transaction
        </Button>
      </Surface>
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
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  servicesList: {
    maxHeight: 200,
  },
  selectedService: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    marginVertical: 10,
  },
  totalCost: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
});

export default AddNewTransaction;
