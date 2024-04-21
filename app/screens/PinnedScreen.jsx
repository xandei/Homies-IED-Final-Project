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
import {
  doc,
  query,
  getDoc,
  collection,
  where,
  getDocs,
} from "firebase/firestore";

import { useState, useEffect } from "react";
import { UserContext } from "../../userContext";

function PinnedScreen() {
  const currentUser = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPinnedPropertyList()
  }, [pinnedPropertyList]);

  const [pinnedPropertyList, setPinnedPropertyList] = useState([]);

  const getPinnedPropertyList = async () => {
    try {
      setLoading(true);
      setPinnedPropertyList([]);
      const querySnapshot = await getDocs(
        collection(FirebaseDB, `Users/${currentUser.uid}/Pinned`)
      );
      setLoading(false);
      querySnapshot.forEach((doc) => {
        setPinnedPropertyList((property) => [...property, doc.data()]);
      });
    } catch (err) {
      console.log(err.message);
      setLoading(false)
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
                You haven't applied to any listings yet. Start browsing and find your perfect place!
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
  },
  placeHolderContainer: {
    flex: 1,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
