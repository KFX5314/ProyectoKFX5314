/* eslint-disable react/prop-types */

import { showMessage } from 'react-native-flash-message'
import React, { useEffect, useState, useContext } from 'react'
import { FlatList, View, StyleSheet, ImageBackground, Image } from 'react-native'
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
      </ImageCard>
    )
  }

  return (
    <View style={styles.container}>
      {order != null && Array.isArray(order.products) && order.products.length > 0 ? (
        <FlatList
          data={order.products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <TextRegular>Este pedido no tiene productos</TextRegular>
      )}
      <View style={styles.FRHeader}>
        <TextSemiBold>FR6: Show order details. ESTO TA EN PROSESO MANO ඞඞඞඞඞඞඞඞඞඞ</TextSemiBold>
        <TextRegular>A customer will be able to look his/her orders up. The system should provide all details of an order, including the ordered products and their prices.</TextRegular>
      </View>
    </View>
  );  
  
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  }
})
