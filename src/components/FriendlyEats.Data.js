import * as firebase from "firebase/app"
import "firebase/firestore";

export const addRestaurant = (data) => {
  const collection = firebase.firestore().collection('restaurants');
  return collection.add(data);
}

export const getAllRestaurants = () => {
  const query = firebase.firestore()
        .collection('restaurants')
        .orderBy('avgRating', 'desc')
        .limit(50);
  
  return query;
}

export const getRestaurant = (id) => {
  return firebase.firestore().collection('restaurants').doc(id).get();
}

export const getFilteredRestaurants = (filters) => {
  const query = firebase.firestore().collection('restaurants');

  if (filters.category !== 'Any') {
    query = query.where('category', '==', filters.category);
  }

  if (filters.city !== 'Any') {
    query = query.where('city', '==', filters.city);
  }

  if (filters.price !== 'Any') {
    query = query.where('price', '==', filters.price.length);
  }

  if (filters.sort === 'Rating') {
    query = query.orderBy('avgRating', 'desc');
  } else if (filters.sort === 'Reviews') {
    query = query.orderBy('numRatings', 'desc');
  }
  return query;
}

export const addRating = (restaurantID, rating) => {
  const collection = firebase.firestore().collection('restaurants');
  const document = collection.doc(restaurantID);
  const newRatingDocument = document.collection('ratings').doc();

  return firebase.firestore().runTransaction(function(transaction) {
    return transaction.get(document).then(function(doc) {
      const data = doc.data();

      const newAverage =
            (data.numRatings * data.avgRating + rating.rating) /
            (data.numRatings + 1);
      
      transaction.update(document, {
        numRatings: data.numRatings + 1,
        avgRating: newAverage
      });
      return transaction.set(newRatingDocument, rating);
    });
  });
}

export const getRating = (id) => {
  return firebase.firestore().collection('restaurants').doc(id).collection('ratings').orderBy('timestamp', 'desc');
}
