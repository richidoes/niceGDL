import React from "react";
import { StyleSheet, View } from "react-native";
import { AirbnbRating, Button, Input } from "react-native-elements";

import { db, auth } from "../../utils/firebase";

export default function AddReviewPlace(props) {
  const { idPlace, setShowModal, setReloadData, toastRef } = props;

  const [rating, setRating] = React.useState(null);
  const [title, setTitle] = React.useState("");
  const [review, setReview] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const addReview = async () => {
    let isSetErrors = true;
    let errorsTemp = {};
    setErrors({}); //clean in case has something

    if (!rating) {
      toastRef.current.show("No ha dado una calificacion");
    } else if (!title) {
      errorsTemp = {
        title: "El titulo es obligatorio",
      };
    } else if (!review) {
      errorsTemp = {
        review: "El comentario es obligatorio",
      };
    } else {
      setIsLoading(true);
      const user = auth.currentUser;
      const payload = {
        idUser: user.uid,
        avatarUser: user.photoURL,
        idPlace: idPlace,
        title: title,
        review: review,
        rating: rating,
        createAt: new Date(),
      };

      await db
        .collection("reviews") // store data in collection, if not exist create it
        .add(payload)
        .then(() => {
          updatePlace();
        })
        .catch(() => {
          setIsLoading(false);
          toastRef.current.show("Error al publicar opinion");
          setShowModal(false);
        });
    }
    isSetErrors && setErrors(errorsTemp);
  };

  //get the average to calculate the place rating
  const updatePlace = async () => {
    const placeRef = db.collection("places").doc(idPlace);

    await placeRef.get().then(async (response) => {
      const placeData = response.data();
      const ratingTotal = placeData.ratingTotal + rating;
      const quantityVoting = placeData.quantityVoting + 1;
      const ratingResult = ratingTotal / quantityVoting;

      await placeRef
        .update({
          rating: ratingResult,
          ratingTotal,
          quantityVoting,
        })
        .then(() => {
          setIsLoading(false);
          setReloadData(true);
          setShowModal(false);
        });
    });
  };

  return (
    <View style={styles.viewBody}>
      <View style={styles.viewRating}>
        <AirbnbRating
          count={5}
          reviews={["Pésimo", "Deficiente", "Normal", "Muy Bueno", "Excelente"]}
          defaultRating={0}
          size={35}
          onFinishRating={(value) => setRating(value)}
        />
      </View>
      <Input
        placeholder="Titulo"
        containerStyle={styles.input}
        onChange={(e) => setTitle(e.nativeEvent.text)}
        errorMessage={errors.title}
      />
      <Input
        placeholder="Comentario..."
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setReview(e.nativeEvent.text)}
        errorMessage={errors.review}
      />
      <Button
        title="Enviar comentario"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={addReview}
        loading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
    marginTop: 20,
  },
  btnContainer: {
    marginTop: 20,
    width: "95%",
  },
  btn: {
    backgroundColor: "#00a680",
  },
  viewRating: {
    height: 120,
    backgroundColor: "#f2f2f2",
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0,
  },
});
