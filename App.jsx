import React, { useState, useEffect, useReducer } from "react";

import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FirebaseAuth, FirebaseDB } from "./firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, query, onSnapshot } from "firebase/firestore";

import NavBarRenters from "./app/components/NavBarRenters";
import NavBarOwners from "./app/components/NavBarOwners";
import SignInScreen from "./app/screens/SignInScreen";
import SignUpScreen from "./app/screens/SignUpScreen";
import PreferredRole from "./app/screens/PreferredRole";
import LogoScreen from "./app/screens/LogoScreen";
import ForgotPasswordScreen from "./app/screens/ForgotPasswordScreen.jsx";

import {
  UserContext,
  PinContext,
  AppliedContext,
  AddPropertyContext,
  MessageContext,
  MessageStateContext,
} from "./Contexts.js";
import ProfileDescriptionScreen from "./app/screens/ProfileDescriptionScreen.jsx";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [pinState, setPinState] = useState(false);
  const [appliedState, setAppliedState] = useState(false);
  const [addState, setAddState] = useState(0);
  const [messageState, setMessageState] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      onAuthStateChanged(FirebaseAuth, async (user) => {
        try {
          console.log("USER: ", user);

          if (user && user?.emailVerified) {
            userDocRef = doc(FirebaseDB, "Users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
              console.log("Document data:", docSnap.data());
              setUser(docSnap.data());
            } else {
              console.log("No user logged in");
            }
          } else {
            setUser(null);
          }
        } catch (err) {
          console.log("error onAuthStateChanged: ", err.message);
        }
      });
    } catch (err) {
      console.log("Error fetching user Data: ", err.message);
    }
  };

  // Message Context
  const INITIAL_STATE = {
    MessageId: "null",
    user: {},
  };

  const MessageReducer = (state, action) => {
    switch (action.type) {
      case "MESSAGE_PRESSED":
        return {
          user: action.payload,
          MessageId:
            user.uid > action.payload.uid
              ? user.uid + action.payload.uid
              : action.payload.uid + user.uid,
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(MessageReducer, INITIAL_STATE);

  return (
    <MessageStateContext.Provider value={{ messageState, setMessageState }}>
      <AddPropertyContext.Provider value={{ addState, setAddState }}>
        <AppliedContext.Provider value={{ appliedState, setAppliedState }}>
          <PinContext.Provider value={{ pinState, setPinState }}>
            <UserContext.Provider value={user}>
              <MessageContext.Provider value={{ data: state, dispatch }}>
                <NavigationContainer>
                  <Stack.Navigator
                    initialRouteName="LogoScreen"
                    screenOptions={{
                      headerShown: false,
                    }}
                  >
                    {user && (
                      <>
                        {user.role === "Owner" ? (
                          <Stack.Screen
                            name="NavBarOwners"
                            component={NavBarOwners}
                          />
                        ) : (
                          <Stack.Screen
                            name="NavBarRenters"
                            component={NavBarRenters}
                          />
                        )}
                      </>
                    )}

                    {!user && (
                      <>
                        <Stack.Screen
                          name="LogoScreen"
                          component={LogoScreen}
                        />
                        <Stack.Screen name="SignIn" component={SignInScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                        <Stack.Screen
                          name="ForgotPassword"
                          component={ForgotPasswordScreen}
                        />
                        <Stack.Screen name="Role" component={PreferredRole} />
                      </>
                    )}
                  </Stack.Navigator>
                </NavigationContainer>
              </MessageContext.Provider>
            </UserContext.Provider>
          </PinContext.Provider>
        </AppliedContext.Provider>
      </AddPropertyContext.Provider>
    </MessageStateContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9CC6DE",
    alignItems: "center",
    justifyContent: "center",
  },
});
