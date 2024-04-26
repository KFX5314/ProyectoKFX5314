/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList } from 'react-native'
// import { StyleSheet, FlatList, View, Pressable } from 'react-native'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { getAll, getPopular } from '../../api/RestaurantEndpoints'
import TextSemiBold from '../../components/TextSemibold'
import defaultProductImage from '../../../assets/product.jpeg'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'

export default function RestaurantsScreen ({ navigation, route }) {
  // TODO: Create a state for storing the restaurants
  const [restaurants, setRestaurants] = useState([])
  const [topProducts, setTopProducts] = useState([])
  useEffect(() => {
    // TODO: Fetch all restaurants and set them to state.
    //      Notice that it is not required to be logged in.
    // TODO: set restaurants to state
    fetchRestaurants()
    fetchTop3Products()
  }, [route])

  const fetchTop3Products = async () => {
    try {
      const fetchedProducts = await getPopular()
      setTopProducts(fetchedProducts)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving the top 3 products ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const fetchRestaurants = async () => {
    try {
      const fetchedRestaurants = await getAll()
      setRestaurants(fetchedRestaurants)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }
  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
        cardStyle={{
          marginTop: 20,
          marginHorizontal: '1%',
          height: 127,
          width: 270,
          padding: 2,
          alignItems: 'flex-start',
          flexDirection: 'row',
          backgroundColor: 'white',
          borderRadius: 15
        }}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>
        }
      </ImageCard>
    )
  }
  const renderHeader = () => {
    return (
    <>
    <TextRegular numberOfLines={2}>{'Most popular products'}</TextRegular>
    <FlatList
      horizontal = {true}
      style = {styles.text}
      data={topProducts}
      renderItem={renderProduct}
    />
    </>
    )
  }
  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        Something went wrong :p
      </TextRegular>
    )
  }

  return (
    <>
    <FlatList
      style={styles.container}
      data={restaurants}
      renderItem={renderRestaurant}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyRestaurantsList}
    />
    </>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
/* const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
}) */
