import { createStackNavigator } from "@react-navigation/stack";
import React, { useState } from 'react';
import { Alert } from "react-native";
import Services from "../screens/Services";
import AddNewService from "../screens/AddNewService";
import ServiceDetail from "../screens/ServiceDetail";
// import EditService from "../screens/EditService";
import EditService from "../screens/EditService";
import { deleteService } from "../store";
import { useMyContextController } from "../store";
import { IconButton, Menu } from "react-native-paper";

const Stack = createStackNavigator();

const RouterService = () => {
  const [controller, dispatch] = useMyContextController();
  const { userlogin } = controller;
  const [visible, setVisible] = useState(false);
  // const dispatch = useDispatch();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Stack.Navigator
      initialRouteName="Services"
      screenOptions={{
        title: userlogin != null ? userlogin.name : "",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "pink",
        },
      }}
    >
      <Stack.Screen
        name="Services"
        component={Services}
        options={{
          // title: "Services",
          // headerRight: () => (
          //   <IconButton
          //     icon="plus"
          //     onPress={() => {
          //       /* Add new service action */
          //     }}
          //   />
          // ),
        }}
      />
      <Stack.Screen
        name="AddNewService"
        component={AddNewService}
        options={{
          // headerRight: () => (
          //   <IconButton
          //     icon="check"
          //     onPress={() => {
          //       /* Save new service action */
          //     }}
          //   />
          // ),
        }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetail}
        options={({ route, navigation }) => ({
          headerRight: () => (
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}
            >
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  navigation.navigate("EditService", {
                    serviceId: route.params.serviceId,
                  });
                }}
                title="Edit"
              />
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  Alert.alert(
                    "Delete Service",
                    "Are you sure you want to delete this service?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Yes",
                        onPress: () => {
                          deleteService(dispatch, route.params.serviceId);
                          navigation.navigate("Services");
                        },
                      },
                    ]
                  );
                }}
                title="Delete"
              />
            </Menu>
          ),
        })}
      />
      <Stack.Screen
        name="EditService"
        component={EditService}
        options={{
          // no headerright
          headerRight: () => null,
        }}
      />
    </Stack.Navigator>
  );
};

export default RouterService;
