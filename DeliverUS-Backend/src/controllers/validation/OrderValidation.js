// DONE: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

import { check } from 'express-validator'
import { checkOrderIsPending} from '../../middlewares/OrderMiddleware'
import { checkRestaurantExists } from '../../middlewares/OrderMiddleware'

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
  
const create = [
    check('restaurantId').exists().isInt({ min: 1 }).toInt().custom(checkRestaurantExists),
    check('products').exists().isArray({ min: 1 }).custom(checkProducts)
    ]
// DONE: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
    check('restaurantId').not().exists(),
    check('products').exists().isArray({ min: 1 }).custom(checkProducts),
    check('products').exists().isArray({ min: 1 }).custom(checkOrderIsPending),
]

export { create, update }
