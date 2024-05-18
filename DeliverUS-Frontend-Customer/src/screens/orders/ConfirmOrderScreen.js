/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { FlatList, View, StyleSheet, ImageBackground } from 'react-native'
import { create } from '../../api/OrderEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { getOrderDetail } from '../../api/OrderEndpoints'
import defaultProductImage from '../../../assets/product.jpeg'
import { showMessage } from 'react-native-flash-message'
import getOrderTotal from '../restaurants/RestaurantDetailScreen'

export default function ConfirmOrderScreen ({ navigation, route }) { // ONIT
  const [order, setOrder] = useState({})

  const renderFooter = () => {
    return (
      <View style={{ flex: 1, margin: 30 }}>

        {Object.keys(order).length > 0 &&
        <View style={styles.footerContainer}>
          <TextSemiBold>
            Total price: {getOrderTotal().toFixed(2)}€
          </TextSemiBold>
          <View style={styles.orderActionsContainer}>
            <Pressable
              onPress={() => { setOrder({}) && navigation.navigate('RestaurantScreen') }}
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

            <Pressable
              onPress={() => { create(order) }}
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
                  Confirm order
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
    
      <FlatList
          ListFooterComponent={renderFooter}
          keyExtractor={(item) => item.id.toString()}
        />
  </View>
  )
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
