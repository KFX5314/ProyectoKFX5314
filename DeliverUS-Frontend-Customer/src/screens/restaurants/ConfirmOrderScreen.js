/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { FlatList, View, StyleSheet, ImageBackground, Image, Pressable } from 'react-native'
import { create } from '../../api/OrderEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as yup from 'yup'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { getDetail } from '../../api/RestaurantEndpoints'
import defaultProductImage from '../../../assets/product.jpeg'
import { showMessage } from 'react-native-flash-message'
import TextError from '../../components/TextError'

export default function ConfirmOrderScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)

  const [backendErrors, setBackendErrors] = useState()
  const [orderValues, setOrderValues] = useState({ products: [], userId: loggedInUser.id, address: loggedInUser.address, restaurantId: route.params.id })
  const validationSchema = yup.object().shape({
    products: yup
      .array(yup.object({
        productId: yup.number().required('Product ID is required'),
        quantity: yup
          .number()
          .integer()
          .min(1, 'Invalid quantity')
          .required('Product quantity is required')
      })),
    address: yup.string().required('Address is required'),
    restaurantId: yup.number().required('Restaurant ID is required')
  })
  useEffect(() => {
    fetchRestaurantDetails()
  }, [loggedInUser, route])

  const fetchRestaurantDetails = async () => {
    try {
      const restaurantDetails = await getDetail(route.params.id)
      const products = restaurantDetails.products
      const updatedOrderValues = { ...orderValues, products: [] }

      products.forEach(p => {
        if (route.params.order[p.id] > 0) {
          updatedOrderValues.products.push({ productId: p.id, quantity: route.params.order[p.id] })
        }
      })

      setOrderValues(updatedOrderValues)
      setRestaurant(restaurantDetails)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const createOrder = async (values) => {
    setBackendErrors([])
    console.log(values)
    try {
      const createdOrder = await create(values)
      showMessage({
        message: `Order ${createdOrder.id} succesfully created`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.reset({
        index: 0,
        routes: [{ name: 'My Orders', params: { screen: 'OrdersScreen', params: { dirty: true } } }]
      })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  const handleConfirmPress = async () => {
    try {
      await validationSchema.validate(orderValues, { abortEarly: false })
      createOrder(orderValues)
    } catch (validationErrors) {
      setBackendErrors(validationErrors.errors)
      showMessage({
        message: `Validation failed: ${validationErrors.errors.join(', ')}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const renderHeader = () => {
    return (
      <View>
      <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage } : undefined} style={styles.imageBackground}>
        <View style={styles.restaurantHeaderContainer}>
          <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo } : undefined} />
          <TextSemiBold textStyle={styles.textTitle}>Confirm or dismiss your order</TextSemiBold>
          <TextRegular textStyle={styles.description}>{
            route.params.shippingCosts > 0
              ? 'Shipping costs: ' + route.params.shippingCosts.toFixed(2) + '€'
              : 'No shipping costs'}
          </TextRegular>
          <TextRegular textStyle={styles.textTitle}>Total price: {route.params.totalCost.toFixed(2)}€</TextRegular>
        </View>
      </ImageBackground>
    </View>
    )
  }
  const renderFooter = () => {
    return (
      <View style={styles.footerContainer}>
        <View style={styles.orderActionsContainer}>
        {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }
          <Pressable
            onPress={() => navigation.goBack()}
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
                Dismiss
              </TextRegular>
            </View>
          </Pressable>
          <Pressable
            onPress={handleConfirmPress}
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
                Confirm
              </TextRegular>
            </View>
          </Pressable>
        </View>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    if (route.params.order[item.id] > 0) {
      return (
        <ImageCard
          imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
          title={item.name}
        >
          <TextRegular numberOfLines={2}>{item.description}</TextRegular>
          <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
          <View style={styles.orderInfoContainer}>
          <TextSemiBold>{route.params.order[item.id]} items</TextSemiBold>
            <TextSemiBold>Subtotal: {(route.params.order[item.id] * item.price).toFixed(2)}€</TextSemiBold>
          </View>
        </ImageCard>
      )
    }
  }

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      // ListEmptyComponent={renderEmptyProductsList}
      data={restaurant.products}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
    />)
}

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    justifyContent: 'space-between'
  },
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
    color: 'white',
    margin: 5
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
