import { createContext, useContext, useMemo, useReducer } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Alert } from "react-native";

const MyContext = createContext();
MyContext.displayName = "vbdvabv";
// Define Reducer
const reducer = (state, action) => {
  switch (action.type) {
    case "USER_LOGIN":
      return { ...state, userLogin: action.value };
    case "LOGOUT":
      return { ...state, userLogin: null };
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
        dispatch({ type: "USER_LOGIN", value: u.data() })
      )
    )
    .catch((e) => Alert.alert("sai email va password"));
};

const logout = (dispatch) => {
  auth()
    .signOut()
    .then(() => dispatch({ type: "LOGOUT" }));
};

export { MyContextControllerProvider, useMyContextController, login, logout };
