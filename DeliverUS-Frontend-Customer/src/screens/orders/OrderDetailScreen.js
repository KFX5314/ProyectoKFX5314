/* eslint-disable react/prop-types */

import { showMessage } from 'react-native-flash-message'
import React, { useEffect, useState, useContext } from 'react'
import { FlatList, View, StyleSheet, ImageBackground } from 'react-native'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { getOrderDetail } from '../../api/OrderEndpoints'
import defaultProductImage from '../../../assets/product.jpeg'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    fetchOrderDetail()
  }, [route, loggedInUser])

  async function fetchOrderDetail () {
    try {
      const fetchedOrder = await getOrderDetail(route.params.id)
      setOrder(fetchedOrder)
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
        {/* Estatus de pedido */}
        <TextRegular style={styles.details}>
          Status: <TextSemiBold textStyle={order.status === 'in process'
          ? { color: GlobalStyles.brandSecondary }
          : order.status === 'sent'
            ? { color: GlobalStyles.brandGreen }
            : order.status === 'delivered'
              ? { color: GlobalStyles.brandBlue }
              : { color: GlobalStyles.brandPrimary }}>
            { order.status }
          </TextSemiBold>
        </TextRegular>
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
        <TextRegular style={styles.total}>Total: {order.price}€</TextRegular>
        <TextRegular style={order.shippingCosts ? styles.shipping : styles.freeShipping}>Includes {order.shippingCosts ? order.shippingCosts.toString() + '€ of shipping' : 'free shipping'}</TextRegular>
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
  }
})
