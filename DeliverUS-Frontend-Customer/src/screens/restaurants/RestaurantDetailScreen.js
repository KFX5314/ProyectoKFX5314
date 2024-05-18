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
// import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [order, setOrder] = useState([])
  const [quantities, setQuantities] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    fetchRestaurantDetail()
  }, [loggedInUser, route])

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const renderFooter = () => {
    return (
      <View style={[{
        flex: 1,
        margin: 30
      }]}>
        {order.some(product => product[0] > 0) &&
        <View style={styles.footerContainer}>
          <TextSemiBold>
            {order.flatMap(p => { return p[1] }).reduce((acc, curr) => acc + curr, 0) >= 10
              ? 'FREE SHIPPING!'
              : 'Shipping costs: ' + restaurant.shippingCosts.toFixed(2) + '€'}
          </TextSemiBold>
          <TextSemiBold>
            Total price: {order.flatMap(p => { return p[1] }).reduce((acc, curr) => acc + curr, 0) >= 10
            ? order.flatMap(p => { return p[1] }).reduce((acc, curr) => acc + curr, 0).toFixed(2)
            : order.flatMap(p => { return p[1] }).reduce((acc, curr) => acc + curr, restaurant.shippingCosts).toFixed(2)}€
          </TextSemiBold>
          <View style={styles.actionButtonsContainer}>
            <Pressable
              onPress={() => {
                loggedInUser
                  ? navigation.navigate('ConfirmOrderScreen', {
                    order, id: route.params.id
                  })
                  : navigation.navigate('LoginScreen')
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
            <Pressable
              onPress={() => { cancelOrder() }}
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
                  Cancel order
                </TextRegular>
              </View>
            </Pressable>
            </View>
          </View>}
      </View>
    )
  }

  function cancelOrder () {
    const auxOrder = [...order].map(x => [0, 0])
    setOrder(auxOrder)
  }
  function updateOrder ({ index, item, quantity = null }) {
    const auxOrder = [...order]
    if (quantity === null) {
      quantity = quantities[index]
    }
    auxOrder[index][0] = quantity
    auxOrder[index][1] = item.price.toFixed(2) * quantity
    setOrder(auxOrder)
  }
  function updateQuantities ({ index, quantity }) {
    const auxQuantities = [...quantities]
    auxQuantities[index] = parseInt(quantity)
    setQuantities(auxQuantities)
  }
  const renderProduct = ({ index, item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>
        }
        {order[index][0] > 0 &&
        <View style={styles.orderInfoContainer}>
          <TextSemiBold>{order[index][0]} items</TextSemiBold>
          <TextSemiBold>Subtotal: {order[index][1].toFixed(2)}€</TextSemiBold>
        </View>
        }
        {order[index][0] === 0 && item.availability &&
          <View style={styles.actionButtonsContainer}>
          <TextInput
            style={styles.input}
            name='quantity'
            placeholder='product quantity'
            keyboardType='numeric'
            onChangeText={quantity => {
              if (parseInt(quantity) > 0) {
                updateQuantities({ index, quantity })
              }
            }}
          />
          <Pressable
            onPress={() => { updateOrder({ index, item }) }}
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
                Add to order
              </TextRegular>
            </View>
          </Pressable>
        </View>}
        {order[index][0] > 0 &&
          <View style={styles.actionButtonsContainer}>
          <TextInput
            style={styles.input2}
            name='quantity'
            placeholder='product quantity'
            keyboardType='numeric'
            onChangeText={quantity => {
              if (parseInt(quantity) > 0) {
                updateQuantities({ index, quantity })
              }
            }}
          />
          <Pressable
            onPress={() => { updateOrder({ index, item }) }}
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
                Update quantity
              </TextRegular>
            </View>
          </Pressable>
          <Pressable
            onPress={() => { updateOrder({ index, item, quantity: 0 }) }}
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
                Remove from order
              </TextRegular>
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

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      const products = fetchedRestaurant.products.map(x => [0, 0])
      const auxQuantities = fetchedRestaurant.products.map(x => 0)
      setQuantities(auxQuantities)
      setOrder(products)
      setRestaurant(fetchedRestaurant)
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
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyProductsList}
        style={styles.container}
        data={restaurant.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0
  },
  footerContainer: {
    padding: 10,
    borderColor: GlobalStyles.brandPrimary,
    borderWidth: 2,
    backgroundColor: 'white',
    borderTopWidth: 10,
    borderTopColor: '#ccc',
    width: '100%',
    alignItems: 'center',
    bottom: 0
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    alignItems: 'center',
    width: '75%'
  },
  input: {
    borderColor: GlobalStyles.brandPrimary,
    borderWidth: 2,
    height: 40,
    textAlign: 'center',
    marginVertical: 12,
    paddingHorizontal: 10
  },
  input2: {
    borderColor: GlobalStyles.brandGreen,
    borderWidth: 2,
    height: 40,
    textAlign: 'center',
    marginVertical: 12,
    paddingHorizontal: 10
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
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
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
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  }
})
