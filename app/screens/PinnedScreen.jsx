import React, { useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import HeaderComponent from "../components/HeaderComponent";
import PostCard from "../components/PostCard";
import { FirebaseDB } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";

import { useState, useEffect } from "react";
import { AppliedContext, PinContext, UserContext } from "../../Contexts";
import { useIsFocused } from "@react-navigation/native";

function PinnedScreen() {
  const currentUser = useContext(UserContext);
  const { pinState } = useContext(PinContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPinnedPropertyList();
  }, [pinState]);

  const [pinnedPropertyList, setPinnedPropertyList] = useState([]);

  const getPinnedPropertyList = async () => {
    setPinnedPropertyList([]);
    try {
      setLoading(true);
      const querySnapshot = await getDocs(
        collection(FirebaseDB, `Users/${currentUser.uid}/Pinned`)
      );
      setLoading(false);
      querySnapshot.forEach((doc) => {
        setPinnedPropertyList((property) => [...property, doc.data()]);
      });
    } catch (err) {
      console.log(err.message);
      setLoading(false);
    }
  };

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getPinnedPropertyList();
      setRefreshing(false);
    }, 750);
  }, []);

  return (
    <SafeAreaView>
      <HeaderComponent title="Pinned Places" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.container}
      >
        <View style={styles.pinnedContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="midnightblue" />
          ) : pinnedPropertyList[0] ? (
            pinnedPropertyList.map((property, index) => (
              <PostCard key={index} data={property} />
            ))
          ) : (
            <View style={styles.placeHolderContainer}>
              <Text
                style={{ fontSize: 14, color: "gray", textAlign: "center" }}
              >
                You don't have any pinned posts yet. Find interesting listings
                and pin them for easy access!
              </Text>
            </View>
          )}
        </View>
        <View style={{ height: 80 }}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PinnedScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    width: "100%",
  },
  pinnedContainer: {
    flexDirection: "column",
    marginTop: 12,
    marginBottom: 30,
    // backgroundColor: "red"
  },
  placeHolderContainer: {
    flex: 1,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
