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
  const { loggedInUser } = useContext(AuthorizationContext)
  const [editAddress, setEditAddress] = useState(false)
  const [newAddress, setNewAddress] = useState('')

  useEffect(() => {
    fetchOrderDetail()
  }, [route, loggedInUser, editAddress])

  async function fetchOrderDetail () {
    try {
      const fetchedOrder = await getOrderDetail(route.params.id)
      setOrder(fetchedOrder)
      setNewAddress(fetchedOrder.address)
    } catch (error) {
      console.log(error)
      showMessage({
        message: `There was an error while retrieving order details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  async function saveOrderAddress () {
    try {
      await update(route.params.id, {
        products: order.products.map(p => {
          return {
            quantity: p.OrderProducts.quantity,
            productId: p.OrderProducts.ProductId
          }
        }),
        address: newAddress
      })
    } catch (error) {
      console.log(error)
      showMessage({
        message: `There was an error while updating order address (id ${route.params.id}). ${error}`,
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
        <TextRegular>Quantity: <TextSemiBold textStyle={styles.price}>{item.OrderProducts.quantity}</TextSemiBold></TextRegular>
        <TextRegular>Total: <TextSemiBold textStyle={styles.price}>{(item.OrderProducts.quantity * item.price).toFixed(2)}€</TextSemiBold></TextRegular>
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
        {editAddress
          ? (
          <TextInput
            style={styles.input}
            value={newAddress}
            onChangeText={setNewAddress}
            placeholder='New address'
          />
            )
          : (
          <TextRegular style={styles.details}>{order.address}</TextRegular>
            )}
        <Pressable
          onPress={async () => {
            if (editAddress) {
              await saveOrderAddress()
            }

            setEditAddress(!editAddress)
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandBlueTap
                : GlobalStyles.brandGreen
            },
            styles.actionButton
          ]}
        >

            {/* lapiz */}
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center', height: 2 }]}>
                <MaterialCommunityIcons name='pencil' color={'white'} size={20} />
                <TextRegular textStyle={styles.text}>
                    {editAddress ? 'Save' : 'Edit'}
                </TextRegular>
            </View>
        </Pressable>
      </View>
      {order != null && Array.isArray(order.products) && order.products.length > 0
        ? (
          <FlatList
            data={order.products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
          />
          )
        : (
          <TextRegular>This order has no products!</TextRegular>
          )}
      <TextRegular style={styles.total}>Total: {order.price?.toFixed(2)}€</TextRegular>
      <TextRegular style={order.shippingCosts ? styles.shipping : styles.freeShipping}>Includes {order.shippingCosts ? order.shippingCosts.toFixed(2) + '€ of shipping' : 'free shipping'}</TextRegular>
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
  total: {
    ...GlobalStyles.headerText,
    textAlign: 'right'
  },
  shipping: {
    textAlign: 'right',
    padding: 8
  },
  freeShipping: {
    textAlign: 'right',
    padding: 8,
    color: GlobalStyles.brandGreen,
    fontWeight: 'bold'
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8
  },
  text: {
    color: 'white'
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flex: 1,
    marginLeft: 8,
    paddingVertical: 4
  }
})
