import { createContext, useContext, useMemo, useReducer } from "react";
import auth, { updateCurrentUser } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Alert, ToastAndroid } from "react-native";

const MyContext = createContext();
MyContext.displayName = "vbdvabv";
const SERVICES = firestore().collection("Services");

// Define Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case "USER_LOGIN":
      return { ...state, userLogin: action.value, userEmail: action.email };
    case "LOGOUT":
      return { ...state, userLogin: null, userEmail: null };
    case "DELETE_SERVICE":
      return {
        ...state,
        services: state.services.filter(
          (service) => service.id !== action.serviceId
        ),
      };
    default:
      return new Error("Action not found");
  }
};

// Define MyContextControllerProvider
const MyContextControllerProvider = ({ children }) => {
  // Initialize store
  const initialState = {
    userLogin: null,
    services: [],
    userEmail: [],
  };

  const [controller, dispatch] = useReducer(reducer, initialState);
  // Distinguish useMemo and useEffect
  const value = useMemo(() => [controller, dispatch], [controller, dispatch]);

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

const useMyContextController = () => {
  const context = useContext(MyContext);
  if (context == null)
    return new Error(
      "useMyContextController must be inside MyContextControllerProvider"
    );
  return context;
};

const USERS = firestore().collection("UserLab3");

const login = (dispatch, email, password) => {
  auth()
    .signInWithEmailAndPassword(email, password)
    .then((response) =>
      USERS.doc(email).onSnapshot((u) =>
        dispatch({ type: "USER_LOGIN", value: u.data(), email })
      )
    )
    .catch((e) => Alert.alert("sai email va password"));
};

const deleteService = (dispatch, serviceId) => {
  SERVICES.doc(serviceId)
    .delete()
    .then(() => {
      // Optionally dispatch an action to update the state
      dispatch({ type: "DELETE_SERVICE", serviceId });
    })
    .catch((error) => {
      console.error("Error deleting service: ", error);
      Alert.alert("Error", "Failed to delete service. Please try again.");
    });
};

const logout = (dispatch) => {
  auth()
    .signOut()
    .then(() => dispatch({ type: "LOGOUT" }));
};
// const getCurrentUser = (dispatch) => {
//   auth()
//     .onAuthStateChanged((user) => {
//       if (user) {
//         // User is signed in
//         dispatch({ type: "USER_LOGIN", value: user });
//       } else {
//         // User is signed out
//         dispatch({ type: "LOGOUT" });
//       }
//     })
//     .catch((error) => {
//       console.error("Error getting current user: ", error);
//       Alert.alert("Error", "Failed to get current user. Please try again.");
//     });
// };
export {
  MyContextControllerProvider,
  useMyContextController,
  login,
  logout,
  deleteService,
  // getCurrentUser,
};
