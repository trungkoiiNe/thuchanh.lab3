import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useMyContextController } from "../store";

const UserInfo = () => {
  const [controller] = useMyContextController();
  const { userLogin } = controller;
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    address: '',
    phone: '',
    avatarUrl: '',
  });
  const [visible, setVisible] = useState({ name: false, address: false, phone: false });
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const userDoc = await firestore()
      .collection('UserLab3')
      .where('email', '==', userLogin.email)
      .get();

    if (!userDoc.empty) {
      const userData = userDoc.docs[0].data();
      setUserInfo({
        fullName: userData.fullName || '',
        address: userData.address || '',
        phone: userData.phone || '',
        avatarUrl: userData.avatarUrl || '',
      });
    }
  };

  const handleUpdate = async (field) => {
    try {
      await firestore()
        .collection('UserLab3')
        .where('email', '==', userLogin.email)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.update({ [field]: editValue });
          });
        });
      setUserInfo({ ...userInfo, [field]: editValue });
      setVisible({ ...visible, [field]: false });
      alert('Information updated successfully');
    } catch (error) {
      console.error('Error updating user info:', error);
      alert('Failed to update information');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const ref = storage().ref().child(`avatars/${userLogin.email}`);
      await ref.put(blob);
      const url = await ref.getDownloadURL();
      await firestore()
        .collection('UserLab3')
        .where('email', '==', userLogin.email)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            doc.ref.update({ avatarUrl: url });
          });
        });
      setUserInfo({ ...userInfo, avatarUrl: url });
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: userInfo.avatarUrl || 'https://via.placeholder.com/150' }} style={styles.avatar} />
      <Button mode="outlined" onPress={pickImage}>Change Avatar</Button>
      <Text style={styles.infoText}>Name: {userInfo.fullName}</Text>
      <Button onPress={() => { setVisible({ ...visible, name: true }); setEditValue(userInfo.fullName); }}>Edit Name</Button>
      <Text style={styles.infoText}>Address: {userInfo.address}</Text>
      <Button onPress={() => { setVisible({ ...visible, address: true }); setEditValue(userInfo.address); }}>Edit Address</Button>
      <Text style={styles.infoText}>Phone: {userInfo.phone}</Text>
      <Button onPress={() => { setVisible({ ...visible, phone: true }); setEditValue(userInfo.phone); }}>Edit Phone</Button>

      <Portal>
        <Dialog visible={visible.name} onDismiss={() => setVisible({ ...visible, name: false })}>
          <Dialog.Title>Edit Name</Dialog.Title>
          <Dialog.Content>
            <TextInput value={editValue} onChangeText={setEditValue} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible({ ...visible, name: false })}>Cancel</Button>
            <Button onPress={() => handleUpdate('fullName')}>Save</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={visible.address} onDismiss={() => setVisible({ ...visible, address: false })}>
          <Dialog.Title>Edit Address</Dialog.Title>
          <Dialog.Content>
            <TextInput value={editValue} onChangeText={setEditValue} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible({ ...visible, address: false })}>Cancel</Button>
            <Button onPress={() => handleUpdate('address')}>Save</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={visible.phone} onDismiss={() => setVisible({ ...visible, phone: false })}>
          <Dialog.Title>Edit Phone</Dialog.Title>
          <Dialog.Content>
            <TextInput value={editValue} onChangeText={setEditValue} keyboardType="phone-pad" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible({ ...visible, phone: false })}>Cancel</Button>
            <Button onPress={() => handleUpdate('phone')}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default UserInfo;
