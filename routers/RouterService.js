import { createStackNavigator } from "@react-navigation/stack";
import Services from "../screens/Services";
import AddNewService from "../screens/AddNewService";
import ServiceDetail from "../screens/ServiceDetail";
// import EditService from "../screens/EditService";
import EditService from "../screens/EditService";

import { useMyContextController } from "../store";
import { IconButton } from "react-native-paper";

const Stack = createStackNavigator();

const RouterService = () => {
  const [controller, dispatch] = useMyContextController();
  const { userlogin } = controller;

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
          headerRight: () => (
            <IconButton
              icon="plus"
              onPress={() => {
                /* Add new service action */
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="AddNewService"
        component={AddNewService}
        options={{
          headerRight: () => (
            <IconButton
              icon="check"
              onPress={() => {
                /* Save new service action */
              }}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetail}
        options={({ route, navigation }) => ({
          headerRight: () => (
            <IconButton
              icon="pencil"
              onPress={() => {
                navigation.navigate("EditService", {
                  serviceId: route.params.serviceId,
                });
              }}
            />
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
