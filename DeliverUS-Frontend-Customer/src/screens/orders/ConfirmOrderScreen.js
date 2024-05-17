import { StyleSheet, View, Pressable, FlatList } from 'react-native'
import TextRegular from '../../components/TextRegular'

export default function EditOrderScreen ({ navigation, route }) { // ONIT
  return (
        <View>
        <TextRegular>Esta es la order</TextRegular>
        <TextRegular> {route.params.orderId} </TextRegular>
        </View>
  )
}
