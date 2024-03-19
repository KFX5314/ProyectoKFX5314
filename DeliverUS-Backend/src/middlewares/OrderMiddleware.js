import { Order, Restaurant } from '../models/models.js'

// DONE: Implement the following function to check if the order belongs to current loggedIn customer (order.userId equals or not to req.user.id)
const checkOrderCustomer = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (req.user.id === order.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}

// DONE: Implement the following function to check if the restaurant of the order exists
const checkRestaurantExists = async (req, res, next) => {
  const order = Order.build(req.body)
  try {
    const restaurant = await Restaurant.findByPk(order.restaurantId)
    if (restaurant) {
      next()
    } else {
      return res.status(409).send('Restaurant not found')
    }
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkOrderOwnership = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: {
        model: Restaurant,
        as: 'restaurant'
      }
    })
    if (req.user.id === order.restaurant.userId) {
      return next()
    } else {
      return res.status(403).send('Not enough privileges. This entity does not belong to you')
    }
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkOrderVisible = (req, res, next) => {
  if (req.user.userType === 'owner') {
    checkOrderOwnership(req, res, next)
  } else if (req.user.userType === 'customer') {
    checkOrderCustomer(req, res, next)
  }
}

const checkOrderIsPending = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isPending = !order.startedAt
    if (isPending) {
      return next()
    } else {
      return res.status(409).send('The order has already been started')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderCanBeSent = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isShippable = order.startedAt && !order.sentAt
    if (isShippable) {
      return next()
    } else {
      return res.status(409).send('The order cannot be sent')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
const checkOrderCanBeDelivered = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    const isDeliverable = order.startedAt && order.sentAt && !order.deliveredAt
    if (isDeliverable) {
      return next()
    } else {
      return res.status(409).send('The order cannot be delivered')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

// 
const checkProducts = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findByPk(orderId, { include: 'products' });
    if (!order) {
      return res.status(404).send('Order not found');
    }
    const products = order.products;
    if (!products || products.length === 0) {
      return res.status(400).send('No products found in the order');
    }
    const restaurant = order.restaurantId;
    for (const product of products)
    {
      if (!product.productId || product.restaurantId != restaurant || product.availability != 1) 
      {
        return res.status(409).send('The order cannot be delivered')
      }
    }
    req.order = order; 
    req.products = products; 
    next();
  } catch (err) {
    console.error('Error checking products:', err);
    return res.status(500).send('Internal Server Error');
  }
}

export { checkProducts };
export { checkOrderOwnership, checkOrderCustomer, checkOrderVisible, checkOrderIsPending, checkOrderCanBeSent, checkOrderCanBeDelivered, checkRestaurantExists }
