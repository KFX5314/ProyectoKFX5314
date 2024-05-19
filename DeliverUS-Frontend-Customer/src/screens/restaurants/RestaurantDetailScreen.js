/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, TextInput } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [order, setOrder] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    fetchRestaurantDetails()
  }, [loggedInUser, route])

  const getOrderSubTotal = () => {
    return Object.entries(order).map((v) => {
      return v[1] * restaurant.products.find(p => p.id.toString() === v[0]).price
    }).reduce((a, b) => a + b, 0)
  }

  const getOrderTotal = () => {
    const subtotal = getOrderSubTotal()

    return subtotal <= 10 ? subtotal + restaurant.shippingCosts : subtotal
  }

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>Total price: {getOrderTotal().toFixed(2)}€</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const renderFooter = () => {
    return (
      <View style={{ flex: 1, margin: 30 }}>

        {Object.keys(order).length > 0 &&
        <View style={styles.footerContainer}>
          {getOrderSubTotal() <= 10 &&
          <TextRegular>
            {`Shipping costs are FREE if the order price is higher than 10€.`}
          </TextRegular>}
          <TextSemiBold>
            {getOrderSubTotal() <= 10 ? `Shipping costs: ${restaurant.shippingCosts.toFixed(2)}€` : 'Free Shipping!'}
          </TextSemiBold>
          <TextSemiBold>
            Total price: {getOrderTotal().toFixed(2)}€
          </TextSemiBold>
          <View style={styles.orderActionsContainer}>
            <Pressable
              onPress={() => { setOrder({}) }}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandPrimaryTap
                    : GlobalStyles.brandPrimary
                },
                styles.actionButton
              ]}>
              <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <TextRegular textStyle={styles.text}>
                  Cancel
                </TextRegular>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                loggedInUser
                  ? navigation.navigate('ConfirmOrderScreen', {
                    order,
                    totalCost: getOrderTotal(),
                    shippingCosts: getOrderSubTotal() <= 10 ? restaurant.shippingCosts : 0,
                    id: route.params.id
                  })
                  : navigation.navigate('Profile', { screen: 'LoginScreen' })
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandBlueTap
                    : GlobalStyles.brandGreen
                },
                styles.actionButton
              ]}>
              <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                <TextRegular textStyle={styles.text}>
                  Place order
                </TextRegular>
              </View>
            </Pressable>
          </View>

        </View>}

      </View>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>

        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>}

        {order[item.id] &&
          <View style={styles.orderInfoContainer}>
            <TextSemiBold>{order[item.id]} items</TextSemiBold>
            <TextSemiBold>Subtotal: {(order[item.id] * item.price).toFixed(2)}€</TextSemiBold>
          </View>}

        {item.availability &&
          <View style={styles.quantityContainer}>
            <Pressable
              onPress={() => {
                if (order[item.id] > 1) {
                  setOrder({
                    ...order,
                    [item.id]: order[item.id] - 1
                  })
                } else {
                  const newOrder = { ...order }
                  delete newOrder[item.id]
                  setOrder(newOrder)
                }
              }}
            >
              <View>
                <MaterialCommunityIcons name='minus' size={20} />
              </View>
            </Pressable>
            <TextInput
              style={styles.quantity}
              name='quantity'
              value={order[item.id] || 0}
              placeholder='quantity'
              keyboardType='numeric'
              onChangeText={value => {
                const newOrder = { ...order }
                const quantity = parseInt(value)

                if (!quantity || quantity <= 0) {
                  delete newOrder[item.id]
                } else {
                  newOrder[item.id] = quantity
                }

                setOrder(newOrder)
              }}
            />
            <Pressable
              onPress={() => {
                setOrder({
                  ...order,
                  [item.id]: (order[item.id] || 0) + 1
                })
              }}
            >
              <View>
                <MaterialCommunityIcons name='plus' size={20} />
              </View>
            </Pressable>
          </View>}

      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetails = async () => {
    try {
      setRestaurant(await getDetail(route.params.id))
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmptyProductsList}
      data={restaurant.products}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
    />
  )
}

const styles = StyleSheet.create({
  footerContainer: {
    padding: 10,
    alignItems: 'center'
  },
  quantityContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantity: {
    borderColor: GlobalStyles.brandGreen,
    borderWidth: 2,
    borderRadius: 2,
    height: 40,
    textAlign: 'center'
  },
  orderInfoContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'flex-end'
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  orderActionsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 16
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    height: 40,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column'
  }
})
