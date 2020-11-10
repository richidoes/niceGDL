import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { Button, Avatar, Rating } from "react-native-elements";
import { map } from "lodash";

import { auth, db } from "../../utils/firebase";
import Loading from "../Loading";
import Modal from "../Modal";
import AddReviewPlace from "./AddReviewPlace";

export default function ListReviews(props) {
  const { navigation, idPlace, toastRef, reloadData, setReloadData } = props;

  const [userLogged, setUserLogged] = React.useState(false);
  const [reviews, setReviews] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(true);
  const [renderComponent, setRenderComponent] = React.useState(null);

  //check if logged
  auth.onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  //get reviews with the same id of place id selected

  React.useEffect(() => {
    db.collection("reviews")
      .where("idPlace", "==", idPlace)
      .get()
      .then((response) => {
        const resultReview = [];

        response.forEach((doc) => {
          const data = doc.data();
          data.id = doc.id; //create a new id foreach doc and set it to data
          resultReview.push(data);
        });
        setReviews(resultReview);
      });
    setReloadData(false);
  }, [reloadData]);

  return (
    <View>
      {userLogged ? (
        <Button
          title="Escribe una opinion"
          buttonStyle={styles.btnAddReview}
          titleStyle={styles.btnTitleAddReview}
          icon={{
            type: "material-community",
            name: "square-edit-outline",
            color: "#00a680",
          }}
          onPress={() => {
            setRenderComponent(
              <AddReviewPlace
                setShowModal={setShowModal}
                setReloadData={setReloadData}
                idPlace={idPlace}
                toastRef={toastRef}
              />
            );
            setShowModal(true);
          }}
        />
      ) : (
        <View>
          <Text
            style={{ textAlign: "center", color: "#00a680", padding: 20 }}
            onPress={() => navigation.navigate("login")}
          >
            Para escribir un comentario necesitas estar logeado{" "}
            <Text style={{ fontWeight: "bold" }}>
              Pulsa AQUI para iniciar sesión
            </Text>
          </Text>
        </View>
      )}
      {map(reviews, (review, index) => (
        <ReviewRender
          key={index}
          review={review}
          userLogged={userLogged}
          toastRef={toastRef}
          setReloadData={setReloadData}
          setIsLoading={setIsLoading}
          idPlace={idPlace}
        />
      ))}
      {renderComponent && (
        <Modal isVisible={showModal} setIsVisible={setShowModal}>
          {renderComponent}
        </Modal>
      )}
      <Loading isVisible={isLoading} text="Eliminando opinion" />
    </View>
  );
}

const ReviewRender = (props) => {
  const { userLogged, toastRef, setReloadData, setIsLoading, idPlace } = props;
  const {
    title,
    review,
    rating,
    createAt,
    avatarUser,
    id,
    idUser,
  } = props.review;

  const createReviewDate = new Date(createAt.seconds * 1000);

  const removeReview = (id) => {
    const userLoggedId = auth.currentUser.uid;

    if (userLoggedId === idUser) {
      Alert.alert(
        "Eliminar Opinion",
        "¿Estas seguro de que quieres eliminar tu opinion?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            onPress: async () => {
              setIsLoading(true);
              let selectedReviewRating;
              const reviewRef = db.collection("reviews").doc(id);
              await reviewRef
                .get()
                .then((response) => {
                  const reviewData = response.data();
                  selectedReviewRating = reviewData.rating;
                })
                .catch(() => {
                  toastRef.current.show("Algo salio mal", 2000);
                });
              const placeRef = db.collection("places").doc(idPlace);
              await placeRef.get().then((response) => {
                const placeData = response.data();
                const ratingTotal =
                  placeData.ratingTotal - selectedReviewRating;
                const quantityVoting = placeData.quantityVoting - 1;
                const ratingResult = ratingTotal / quantityVoting;

                placeRef
                  .update({
                    rating: ratingResult,
                    ratingTotal,
                    quantityVoting,
                  })
                  .then(() => {
                    return;
                  });
              });
              const currentReview = db
                .collection("reviews")
                .where(id, "==", id);
              await currentReview
                .get()
                .then(() => {
                  db.collection("reviews")
                    .doc(id)
                    .delete()
                    .then(() => {
                      setReloadData(true);
                      setIsLoading(false);
                      toastRef.current.show(
                        "Opinion eliminada correctamente",
                        2000
                      );
                    })
                    .catch(() => {
                      setIsLoading(false);
                      toastRef.current.show(
                        "Error al eliminar la opinion",
                        2000
                      );
                    });
                })
                .catch(() => {
                  setIsLoading(false);
                  toastRef.current.show("ocurrio un error desconocido", 2000);
                });
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  return userLogged ? (
    <TouchableOpacity onPress={() => removeReview(id)}>
      <View style={styles.viewReview}>
        <View style={styles.viewImageAvatar}>
          <Avatar
            rounded
            size="large"
            containerStyle={styles.imageAvatarUser}
            source={
              avatarUser
                ? { uri: avatarUser }
                : require("../../../assets/img/avatar-default.jpg")
            }
          />
        </View>
        <View style={styles.viewInfo}>
          <Text style={styles.reviewTitle}>{title}</Text>
          <Text style={styles.reviewText}>{review}</Text>
          <Rating imageSize={15} startingValue={rating} readonly />
          <Text style={styles.reviewData}>
            {createReviewDate.getDate()}/{createReviewDate.getMonth() + 1}/
            {createReviewDate.getFullYear()} - {createReviewDate.getHours()}:
            {createReviewDate.getMinutes() < 10 ? "0" : ""}
            {createReviewDate.getMinutes()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ) : (
    <View style={styles.viewReview}>
      <View style={styles.viewImageAvatar}>
        <Avatar
          rounded
          size="large"
          containerStyle={styles.imageAvatarUser}
          source={
            avatarUser
              ? { uri: avatarUser }
              : require("../../../assets/img/avatar-default.jpg")
          }
        />
      </View>
      <View style={styles.viewInfo}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Text style={styles.reviewText}>{review}</Text>
        <Rating imageSize={15} startingValue={rating} readonly />
        <Text style={styles.reviewData}>
          {createReviewDate.getDate()}/{createReviewDate.getMonth() + 1}/
          {createReviewDate.getFullYear()} - {createReviewDate.getHours()}:
          {createReviewDate.getMinutes() < 10 ? "0" : ""}
          {createReviewDate.getMinutes()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btnAddReview: {
    backgroundColor: "transparent",
  },
  btnTitleAddReview: {
    color: "#00a680",
  },
  viewReview: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 20,
    borderBottomColor: "#e3e3e3",
    borderBottomWidth: 1,
  },
  viewImageAvatar: {
    marginRight: 15,
  },
  imageAvatarUser: {
    marginRight: 15,
    height: 50,
    width: 50,
  },
  viewInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  reviewTitle: {
    fontWeight: "bold",
  },
  reviewText: {
    paddingTop: 2,
    color: "gray",
    marginBottom: 5,
  },
  reviewData: {
    marginTop: 5,
    color: "gray",
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});
