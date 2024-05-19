/* eslint-disable react/prop-types */

import { showMessage } from 'react-native-flash-message'
import React, { useEffect, useState, useContext } from 'react'
import { FlatList, View, StyleSheet, ImageBackground, Pressable, TextInput } from 'react-native'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getOrderDetail, update } from '../../api/OrderEndpoints'
import defaultProductImage from '../../../assets/product.jpeg'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const [modifiedOrder, setModifiedOrder] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)
  const [editingAddress, setEditingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState('')

  useEffect(() => {
    fetchOrderDetail()
  }, [route, loggedInUser, editingAddress])

  const getOrderSubTotal = () => {
    return Object.entries(modifiedOrder).map((v) => {
      return v[1] * order.products.find(p => p.id.toString() === v[0]).price
    }).reduce((a, b) => a + b, 0)
  }

  const getOrderTotal = () => {
    const subtotal = getOrderSubTotal()

    return subtotal <= 10 ? subtotal + (order.restaurant.shippingCosts || 0) : subtotal
  }

  async function fetchOrderDetail () {
    try {
      const fetchedOrder = await getOrderDetail(route.params.orderId)
      setOrder(fetchedOrder)
      setNewAddress(fetchedOrder.address)

      const newOrder = {}

      for (const product of fetchedOrder.products) {
        newOrder[product.id] = product.OrderProducts.quantity
      }

      setModifiedOrder(newOrder)
    } catch (error) {
      console.log(error)
      showMessage({
        message: `There was an error while retrieving order details (id ${route.params.orderId}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  async function saveOrder () {
    try {
      await update(route.params.orderId, {
        products: Object.entries(modifiedOrder).map(v => {
          return {
            quantity: v[1],
            productId: v[0]
          }
        }),
        address: newAddress
      })
    } catch (error) {
      console.log(error)
      showMessage({
        message: `There was an error while updating order address (id ${route.params.orderId}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>

        {modifiedOrder[item.id] &&
          <View style={styles.orderInfoContainer}>
            <TextSemiBold>{modifiedOrder[item.id]} items</TextSemiBold>
            <TextSemiBold>Subtotal: {(modifiedOrder[item.id] * item.price).toFixed(2)}€</TextSemiBold>
          </View>}

        <View style={styles.quantityContainer}>
            <Pressable
              onPress={() => {
                if (modifiedOrder[item.id] > 1) {
                  setModifiedOrder({
                    ...modifiedOrder,
                    [item.id]: modifiedOrder[item.id] - 1
                  })
                } else {
                  const newOrder = { ...modifiedOrder }
                  delete newOrder[item.id]
                  setModifiedOrder(newOrder)
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
              value={modifiedOrder[item.id] || 0}
              placeholder='quantity'
              keyboardType='numeric'
              onChangeText={value => {
                const newOrder = { ...modifiedOrder }
                const quantity = parseInt(value)

                if (!quantity || quantity <= 0) {
                  delete newOrder[item.id]
                } else {
                  newOrder[item.id] = quantity
                }

                setModifiedOrder(newOrder)
              }}
            />
            <Pressable
              onPress={() => {
                setModifiedOrder({
                  ...modifiedOrder,
                  [item.id]: (modifiedOrder[item.id] || 0) + 1
                })
              }}
            >
              <View>
                <MaterialCommunityIcons name='plus' size={20} />
              </View>
            </Pressable>
          </View>
      </ImageCard>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Imagen de fondo */}
      <ImageBackground style={styles.imageBackground} source={(order.restaurant?.logo) ? { uri: process.env.API_BASE_URL + '/' + order.restaurant.logo } : undefined}></ImageBackground>
      {/* Id */}
      <TextRegular style={GlobalStyles.headerText}>Order #{order?.id} on {order.restaurant?.name}</TextRegular>
      {/* Fecha de creacion */}
      <TextRegular style={styles.details}>Placed on {new Date(order.createdAt).toLocaleString().replace(',', ' ')}</TextRegular>
      {/* Dirección */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextRegular style={styles.details}>Deliver to:</TextRegular>
        {editingAddress
          ? (
          <TextInput
            style={styles.input}
            value={newAddress}
            onChangeText={setNewAddress}
            placeholder='New address'
          />
            )
          : <TextRegular style={styles.details}>{order.address}</TextRegular>}

        <Pressable
          onPress={async () => {
            if (editingAddress) {
              await saveOrder()
            }

            setEditingAddress(!editingAddress)
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandBlueTap
                : GlobalStyles.brandGreen
            },
            styles.actionButton
          ]}>

            {/* lapiz */}
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <MaterialCommunityIcons name='pencil' color={'white'} size={20} />
                <TextRegular textStyle={{ color: 'white', marginLeft: 4 }}>
                    {editingAddress ? 'Save' : 'Edit'}
                </TextRegular>
            </View>
        </Pressable>
      </View>

      {order != null && Array.isArray(order.products) && order.products.length > 0
        ? <FlatList
            data={order.products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            style={{ flex: 1 }}
          />
        : <TextRegular>This order has no products!</TextRegular>}

      {Object.keys(modifiedOrder).length > 0 &&
        <View style={styles.actionsContainer}>
          <View style={{ flex: 1 }}>
            <TextRegular style={getOrderSubTotal() <= 10 ? styles.shipping : styles.freeShipping}>
              {getOrderSubTotal() <= 10 ? `Shipping costs: ${order.restaurant.shippingCosts.toFixed(2)}€` : 'Free Shipping!'}
            </TextRegular>
            <TextRegular style={GlobalStyles.headerText}>
              Total: {getOrderTotal().toFixed(2)}€
              </TextRegular>
          </View>
          <Pressable
            onPress={ async () => {
              await saveOrder()
              navigation.reset({
                index: 0,
                routes: [{ name: 'My Orders', params: { screen: 'OrdersScreen', params: { dirty: true } } }]
              })
            }}
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
                Update order
              </TextRegular>
            </View>
          </Pressable>
        </View>}
    </View>
  )
}

const styles = StyleSheet.create({
  imageBackground: {
    height: 100,
    resizeMode: 'cover',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  details: {
    paddingHorizontal: 8
  },
  shipping: {
    padding: 8
  },
  freeShipping: {
    padding: 8,
    color: GlobalStyles.brandGreen,
    fontWeight: 'bold'
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    margin: 8
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginHorizontal: 8
  },
  orderInfoContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'flex-end'
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center'
  }
})
