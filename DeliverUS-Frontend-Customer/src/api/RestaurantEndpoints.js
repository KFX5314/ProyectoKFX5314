import { get } from './helpers/ApiRequestsHelper'
function getAll () {
  // he cambiado esto para que funcione el getall para los customers
  return get('/restaurants')
}

function getDetail (id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories () {
  return get('restaurantCategories')
}

export { getAll, getDetail, getRestaurantCategories }
