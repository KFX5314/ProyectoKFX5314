/* eslint-disable react/prop-types */

import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import ImageCard from '../../components/ImageCard';
import TextSemiBold from '../../components/TextSemibold';
import TextRegular from '../../components/TextRegular';
import { showMessage } from 'react-native-flash-message';
import { getAll, getPopular } from '../../api/RestaurantEndpoints';


export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    async function fetchOrderDetail () {
      try {
        const fetchedOrder = await getOrderDetail(route.params.id)
        setOrder(fetchedOrder)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving order details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrderDetail()
  }, [route, loggedInUser])

  return (
    <View style={styles.container}>
      { order !=null && <FlatList //El and es pa comprobar q no le llega vacía
        data={order.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
      />} : <TextRegular>Este pedido no tiene productos</TextRegular>
      <View style={styles.FRHeader}>
        <TextSemiBold>FR6: Show order details. ESTO TA EN PROSESO MANO ඞඞඞඞඞඞඞඞඞඞ</TextSemiBold>
        <TextRegular>A customer will be able to look his/her orders up. The system should provide all details of an order, including the ordered products and their prices.</TextRegular>
      </View>
    </View>
  )
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
