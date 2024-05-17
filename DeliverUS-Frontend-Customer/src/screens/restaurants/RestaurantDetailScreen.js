/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, TextInput } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [order, setOrder] = useState([])
  const [quantities, setQuantities] = useState([])

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

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
  function updateOrder ({ index, item, quantity = null }) {
    const auxOrder = [...order]
    if (quantity === null) {
      quantity = quantities[index]
    }
    auxOrder[index][0] = quantity
    auxOrder[index][1] = item.price * quantity
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
        {order[index][0] === 0 &&
          <View style={styles.actionButtonsContainer}>
          <TextInput
            style={styles.input}
            name='quantity'
            placeholder='product quantity'
            keyboardType='numeric'
            onChangeText={quantity => updateQuantities({ index, quantity })}
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
            onChangeText={quantity => updateQuantities({ index, quantity })}
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
      <FlatList
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyProductsList}
          style={styles.container}
          data={restaurant.products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
        />
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1
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
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  }
})
