import React, { useContext, useEffect, useState } from 'react'

import { StyleSheet, View, Pressable, FlatList } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { brandPrimary, brandPrimaryTap } from '../../styles/GlobalStyles'

import { AuthorizationContext } from '../../context/AuthorizationContext'
import { getAll } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message';
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import { MaterialCommunityIcons } from '@expo/vector-icons'





export default function OrdersScreen ({ navigation, route }) {
  //done
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getAll()
      setOrders(fetchedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error);
      showMessage({
        message: `There was an error while retrieving orders. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  //done
  
  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route])
  //done
    
  const renderOrder = ({ item }) => {
    return (
      //Imagen de restaurante
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogo}
        title={item.restaurant.name}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
      >

        {/* Estatus de pedido */}
        <TextRegular>Order placed on: <TextSemiBold>{new Date(item.createdAt).toLocaleString().replace(',','  ')}</TextSemiBold></TextRegular>

        {/* Estatus de pedido */}
        <TextRegular>Status: 
          <TextSemiBold textStyle={item.status === 'in process' ? { color: GlobalStyles.brandSecondary } 
          : item.status === 'sent' ? { color: GlobalStyles.brandGreen } 
          : item.status === 'delivered' ? { color: GlobalStyles.brandBlue } 
          : { color: GlobalStyles.brandPrimary }}>
            {item.status}
          </TextSemiBold>
        </TextRegular>
  
        {/* Precio del pedido */}
        <TextRegular>Price: <TextSemiBold>{item.price}€</TextSemiBold></TextRegular>
  
        {/* Modificaciones del pedido */}
        {item.status === 'pending' &&//Renderizado condicional
        <View style={styles.actionButtonsContainer}>
          <Pressable
           onPress={() => showMessage("TO DO") /* navigation.navigate('EditOrderScreen', { orderId: item.id, id: item.restaurant.id })*/}//TODO
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
  
          <Pressable
            onPress={() => { showMessage("TO DO") /*setOrderToBeDeleted(item)*/ }}//TODO
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
      <View style={styles.FRHeader}>
        <TextSemiBold>FR5: Listing my confirmed orders</TextSemiBold>
        <TextRegular>
          A Customer will be able to check his/her confirmed orders, sorted from the most recent to the oldest.
        </TextRegular>
        <TextSemiBold>FR8: Edit/delete order</TextSemiBold>
        <TextRegular>
          If the order is in the state 'pending', the customer can edit or remove the products included or remove the
          whole order. The delivery address can also be modified in the state 'pending'. If the order is in the state
          'sent' or 'delivered' no edition is allowed.
        </TextRegular>
      </View>

      {/* Lista de pedidos */}
      <View style={styles.ordersContainer}>
        { orders!= null && orders.length > 0 ? (
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.orderListContainer}
            horizontal={false}
          />
        ) : (
          <TextRegular>No orders available.</TextRegular>
        )}
      </View>


      <Pressable
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: Math.floor(Math.random() * 100) });
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? brandPrimaryTap : brandPrimary,
          },
          styles.button,
        ]}
      >
        <TextRegular textStyle={styles.text}>Go to Order Detail Screen</TextRegular>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  actionButtonsContainer:
  {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row'

  },
  actionButton: 
  {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 10,
    alignItems: 'center',
    borderRadius: 8,

  },
  ordersContainer: {
    flex: 1,
    padding: 10,
    marginBottom: 10, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GlobalStyles.brandSeparator,
  },
  orderListContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'stretch', 
  },
  container: {
    flex: 1,
    justifyContent: 'left',
    alignItems: 'left',
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
    paddingLeft: 10,
    textAlign: 'center'
  }
})
