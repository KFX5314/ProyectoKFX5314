import React, { useContext, useEffect, useState } from 'react'

import { StyleSheet, View, Pressable, FlatList } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { brandPrimary, brandPrimaryTap } from '../../styles/GlobalStyles'

import { AuthorizationContext } from '../../context/AuthorizationContext'
import { getAll,remove } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import DeleteModal from '../../components/DeleteModal'

export default function OrdersScreen ({ navigation, route }) {
  // done
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  const [ordersToBeDeleted, setOrderToBeDeleted] = useState(null)

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getAll()
      setOrders(fetchedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      showMessage({
        message: `There was an error while retrieving orders. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const removeOrder = async (order) => {
    try {
      //await remove(order.id) //TODO DESCOMENTAR ESTA PARTE DEL CÓDIGO, ES SOLO PA NO TENER QUE REPOBLAR LA BASE DE DATOS CADA VEZ QUE TESTEO ESTO.
      await fetchOrders()
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order from ${new Date(order.createdAt).toLocaleString().replace(',', ' ')} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order from ${new Date(order.createdAt).toLocaleString().replace(',', ' ')} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route])

  const renderOrder = ({ item }) => {
    return (
      // Imagen de restaurante
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogo}
        title={item.restaurant.name}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
      >

        {/* Estatus de pedido */}
        <TextRegular>Order placed on: <TextSemiBold>{new Date(item.createdAt).toLocaleString().replace(',', '  ')}</TextSemiBold></TextRegular>

        {/* Estatus de pedido */}
        <TextRegular>Status:
          <TextSemiBold textStyle={item.status === 'in process'
            ? { color: GlobalStyles.brandSecondary }
            : item.status === 'sent'
              ? { color: GlobalStyles.brandGreen }
              : item.status === 'delivered'
                ? { color: GlobalStyles.brandBlue }
                : { color: GlobalStyles.brandPrimary }}>
            {item.status}
          </TextSemiBold>
        </TextRegular>

        {/* Precio del pedido */}
        <TextRegular>Price: <TextSemiBold>{item.price}€</TextSemiBold></TextRegular>

        {/* Modificaciones del pedido */}
        {item.status === 'pending' &&// Renderizado condicional
        <View style={styles.actionButtonsContainer}>
          <Pressable
           onPress={() => {
            navigation.navigate('EditOrderScreen', { orderId: item.id, id: item.restaurant.id })
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
              <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Edit
              </TextRegular>
            </View>
          </Pressable>

          {/* Boton de borrar */}
          <Pressable
            onPress={() => { setOrderToBeDeleted(item) }}// DONE
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.actionButton
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Delete
              </TextRegular>
            </View>
          </Pressable>
        </View>}

      </ImageCard>
    )
  }

  return (
    <View style={styles.container}>
      {/* Lista de pedidos */}
      <View style={styles.ordersContainer}>
        { orders != null && orders.length > 0
          ? (
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.orderListContainer}
            horizontal={false}
          />
            )
          : (
          <TextRegular>No orders available.</TextRegular>
            )}
      </View>

      {/* Mensaje de confirmación */}
      <DeleteModal
          isVisible={ordersToBeDeleted !== null}
          onCancel={() => setOrderToBeDeleted(null)}
          onConfirm={() => removeOrder(ordersToBeDeleted)}>
            <TextRegular>The products of this order will be deleted as well</TextRegular>
            <TextRegular>If the order is not in pending sate, it cannot be deleted.</TextRegular>
        </DeleteModal>

    </View>
  )
}

const styles = StyleSheet.create({
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
    bottom: 0,
    position: 'absolute',
    width: '90%'
  },
  ordersContainer: {
    flex: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GlobalStyles.brandSeparator
  },
  orderListContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  container: {
    flex: 1,
    justifyContent: 'left',
    alignItems: 'left',
    margin: 10
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
})
