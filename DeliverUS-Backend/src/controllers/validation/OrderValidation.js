// DONE: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

import { check } from 'express-validator'
import { Restaurant, Order } from '../../models/models.js'

const checkRestaurantExists = async (value, { req }) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (!restaurant) {
      return Promise.reject(new Error('The restaurantId does not exist.'))
    } else {
      return Promise.resolve()
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkProducts = async (value, { req }) => {
  try {
    const products = req.body.products
    if (!products || products.length === 0) {
      return Promise.reject(new Error('No products found in the order'))
    }
    const restaurantId = req.body.restaurantId
    for (const product of products) {
      if (!product.productId || product.restaurantId !== restaurantId || product.availability !== 1) {
        return Promise.reject(new Error('The order cannot be delivered'))
      } else if (product.quantity <= 0) {
        return Promise.reject(new Error('Products must have positive quantity'))
      }
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

const create = [
  check('restaurantId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('products').exists().isArray({ min: 1 }),
  check('products').custom(checkProducts)
]
// DONE: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.

const checkOrderIsPending = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    // const isPending = !order.startedAt
    // en teoria este cambio es innecesario, pero ya no se que probar :)
    if (order.startedAt != null || order.sentAt != null || order.deliveredAt != null) {
      return Promise.reject(new Error('The order has already been started'))
    } else {
      return Promise.resolve()
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkNewProducts = async (value, { req }) => {
  try {
    const products = req.body.products
    if (!products || products.length === 0) {
      return Promise.reject(new Error('No products found in the order'))
    }
    const oldOrder = await Order.findByPk(req.body.orderId)
    const restaurantId = oldOrder.restaurantId
    for (const product of products) {
      if (!product.productId || product.quantity <= 0 || product.restaurantId !== restaurantId || product.availability !== 1) {
        return Promise.reject(new Error('The order cannot be delivered'))
      }
    }
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

const update = [
  check('restaurantId').not().exists(),
  check('products').exists().isArray({ min: 1 }),
  check('products').custom(checkNewProducts),
  check('orderId').exists(),
  check('orderId').custom(checkOrderIsPending)
]

export { create, update }
