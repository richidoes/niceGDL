import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Image } from "react-native-elements";
import { size } from "lodash";
import { useNavigation } from "@react-navigation/native";

export default function ListPlaces(props) {
  const { places, handleLoadMore, isLoading } = props;
  const navigation = useNavigation();

  return (
    <View>
      {size(places) > 0 ? (
        //render every place
        <FlatList
          data={places}
          renderItem={(place) => (
            <Place place={place} navigation={navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderPlaces}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text>Cargando lugares</Text>
        </View>
      )}
    </View>
  );
}

const Place = (props) => {
  const { place, navigation } = props;
  const { images, name, description, address, id } = place.item;
  const imagePlace = images[0];

  const goPlace = () => {
    navigation.navigate("place", {
      id: id,
      name: name,
    });
  };
  return (
    <TouchableOpacity onPress={goPlace}>
      <View style={styles.viewPlace}>
        <View style={styles.viewPlaceImage}>
          <Image
            resizeMode="cover"
            PlaceholderContent={
              <ActivityIndicator size="large" color="#00ff00" />
            }
            source={
              imagePlace
                ? { uri: imagePlace }
                : require("../../../assets/img/no-image.png")
            }
            style={styles.imagePlace}
            borderRadius={10}
          />
        </View>
        <View>
          <Text style={styles.placeName}>{name.substr(0, 24)}...</Text>
          <Text style={styles.placeAddress}>{address.substr(0, 24)}...</Text>
          <Text style={styles.placeDescription}>
            {description.substr(0, 50)}...
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FooterList = (props) => {
  const { isLoading } = props;

  if (isLoading) {
    return (
      <View style={styles.loaderPlaces}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  } else {
    return (
      <View style={styles.notFoundPlaces}>
        <Text>No quedan lugares por cargar</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  loaderPlaces: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  viewPlace: {
    flexDirection: "row",
    padding: 12,
    margin: 10,
    backgroundColor: "#C1CEE077",
    borderRadius: 15,
    overflow: "hidden",
  },
  viewPlaceImage: {
    marginRight: 15,
  },
  imagePlace: {
    width: 100,
    height: 100,
  },
  placeName: {
    fontWeight: "bold",
  },
  placeAddress: {
    paddingTop: 4,
    color: "grey",
  },
  placeDescription: {
    paddingTop: 2,

    color: "grey",
    width: 300,
  },
  notFoundPlaces: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
});
