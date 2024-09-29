import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  FlatList,
  VirtualizedList,
  InteractionManager,
} from "react-native";
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
  Alert,
} from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Loading from "../components/Loading";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";
// import Loading from "../components/Loading";

const AddNewTransaction = React.memo(({ navigation }) => {
  const [customer, setCustomer] = useState("");
  const [status, setStatus] = useState("not paid");
  const [discount, setDiscount] = useState("0");
  const [paymentmethod, setPaymentMethod] = useState("");
  const [tax, setTax] = useState("0");
  const [note, setNote] = useState("");
  const [isQRCodeLoaded, setIsQRCodeLoaded] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [visible, setVisible] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const TRANSACTIONS = firestore().collection("Transactions");
  const [isLoading, setIsLoading] = useState(false);
  const [proofImage, setProofImage] = useState(null);

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.cancelled) {
      console.log(result);
      let filePath = result.assets[0].uri;
      if (Platform.OS === "ios") {
        filePath = filePath.replace("file://", "");
      }
      setProofImage(filePath);
    }
  };

  const calculateTotalCostAfterTaxAndDiscount = useCallback(() => {
    const subtotal = selectedServices.reduce(
      (total, service) => total + service.price * service.quantity,
      0
    );
    const taxAmount = subtotal * (parseFloat(tax) / 100);
    const discountAmount = subtotal * (parseFloat(discount) / 100);
    return subtotal + taxAmount - discountAmount;
  }, [selectedServices, tax, discount]);

  const generateQRCodeUrl = useCallback(() => {
    if (paymentmethod === "banking" && calculateTotalCostAfterTaxAndDiscount()!==0) {
      const totalAmount = calculateTotalCostAfterTaxAndDiscount();
      const url = `https://api.vietqr.io/image/970423-64209062003-l8WGEeG.jpg?accountName=DUONG%20NGO%20CHI%20TRUNG&amount=${totalAmount}`;
      console.log("Generated QR Code URL:", url);
      setQrCodeUrl(url);
    } else {
      setQrCodeUrl("");
    }
  }, [paymentmethod, calculateTotalCostAfterTaxAndDiscount]);

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
    console.log("current qr code url", qrCodeUrl);
  }, []);
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      // Perform expensive operations here
      generateQRCodeUrl();
    });
  }, [generateQRCodeUrl]);
  useEffect(() => {
    console.log("Current QR Code URL:", qrCodeUrl);
  }, [qrCodeUrl]);
  const handleDiscountChange = (text) => {
    const numericValue = text
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
    setDiscount(numericValue === "" ? "0" : numericValue);
  };

  const handleTaxChange = (text) => {
    const numericValue = text
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
    setTax(numericValue === "" ? "0" : numericValue);
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
    return subtotal;
  };
  // const calculateTotalCostAfterTaxAndDiscount = () => {
  //   const subtotal = selectedServices.reduce(
  //     (total, service) => total + service.price * service.quantity,
  //     0
  //   );
  //   const taxAmount = subtotal * (parseFloat(tax) / 100);
  //   const discountAmount = subtotal * (parseFloat(discount) / 100);
  //   const totalcostaftertaxanddiscount = subtotal + taxAmount - discountAmount;
  //   return totalcostaftertaxanddiscount;
  // };

  const addTransaction = async () => {
    if (!customer || selectedServices.length === 0) {
      alert("You must select a customer and at least one service.");
      return;
    }

    const admin = auth().currentUser;
    const now = firestore.Timestamp.now();
    const totalcost = calculateTotalCost();
    const totalcostaftertaxanddiscount =
      calculateTotalCostAfterTaxAndDiscount();

    try {
      const transactionData = {
        customer,
        admin: admin.email,
        serviceslist: selectedServices
          .map((s) => `${s.id},${s.quantity}`)
          .join(";"),
        billDate: now,
        status,
        totalcost,
        totalcostaftertaxanddiscount,
        discount: parseFloat(discount),
        paymentmethod,
        tax: parseFloat(tax),
        note,
      };

      if (paymentmethod === "banking" && proofImage) {
        console.log(proofImage);
        const transactionId = TRANSACTIONS.doc().id;
        const reference = storage().ref(
          `transaction_proofs/${transactionId}.jpg`
        );
        await reference.putFile(proofImage);
        const proofImageUrl = await reference.getDownloadURL();
        transactionData.proofImageUrl = proofImageUrl;
      }
      await TRANSACTIONS.add(transactionData);

      alert("Transaction added successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding transaction: ", error);
      alert("Failed to add transaction. Please try again.");
    }
  };
  const ServiceItem = React.memo(({ service, onAdd }) => (
    <List.Item
      title={service.name}
      description={`${service.price.toFixed(2)}`}
      right={() => <IconButton icon="plus" onPress={() => onAdd(service)} />}
    />
  ));
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      nestedScrollEnabled={true}
    >
      <Surface style={styles.surface}>
        <Text style={styles.title}>Add New Transaction</Text>

        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <Button onPress={() => setVisible(true)}>
              {customer ? "Select Another Customer" : "Select Customer"}
            </Button>
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
        {customer && (
          <Text style={styles.selectedCustomer}>
            Selected:{" "}
            {customers.find((c) => c.id === customer)?.fullName ||
              customers.find((c) => c.id === customer)?.email}
          </Text>
        )}

        <Text style={styles.sectionTitle}>Available Services</Text>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <VirtualizedList
              data={services}
              initialNumToRender={10}
              renderItem={({ item }) => (
                <ServiceItem service={item} onAdd={addService} />
              )}
              keyExtractor={(item) => item.id}
              getItemCount={(data) => data.length}
              getItem={(data, index) => data[index]}
            />
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
          Total Cost: ${calculateTotalCostAfterTaxAndDiscount().toFixed(2)}
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
            {/* <RadioButton.Item label="Debit" value="debit" /> */}
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
        {paymentmethod === "banking" && (
          <>
            {qrCodeUrl ? (
              <>
                <Image

                  key={qrCodeUrl}
                  source={{ uri: qrCodeUrl }}
                  style={[{ width: 400, height: 400 },styles.qrcode]}
                  onLoadStart={() => setIsQRCodeLoaded(false)}
                  onLoad={() => setIsQRCodeLoaded(true)}
                  resizeMode="contain"
                  onError={(e) =>
                    console.log("Image loading error:", e.nativeEvent.error)
                  }
                />
                {!isQRCodeLoaded && <Loading />}
              </>
            ) : (
              <Text></Text>
            )}
            <Button mode="contained" onPress={takePhoto}>
              Take Proof Photo
            </Button>
            {proofImage && (
              <Image
                source={{ uri: proofImage }}
                style={{ width: 200, height: 200 }}
              />
            )}
          </>
        )}
        <Button mode="contained" onPress={addTransaction} style={styles.button}>
          Add Transaction
        </Button>
      </Surface>
    </ScrollView>
  );
});

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
  selectedCustomer: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  qrcode: {
    marginTop: 10,
    alignSelf: "center",
  },
});

export default AddNewTransaction;
