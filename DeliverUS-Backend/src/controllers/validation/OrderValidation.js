import { check } from 'express-validator'
import { Product } from '../../models/models.js'
import { Op } from 'sequelize'

const checkProductsAvailibity = async (value, { req }) => {
  try {
    const productIds = value.map(p => p.productId)
    const products = await Product.findAll({ where: { id: { [Op.in]: productIds } } })

    if (products.length !== productIds.length) {
      return Promise.reject(new Error('Non-existing products'))
    }

    const restaurantId = products[0].restaurantId

    for (const p of products) {
      if (p.restaurantId !== restaurantId) {
        return Promise.reject(new Error('Products from different restaurants'))
      }

      if (!p.availability) {
        return Promise.reject(new Error(`Product ${p.id} not available`))
      }
    }

    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}

// DONE: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant
const create = [
  check('restaurantId').exists().isInt({ min: 1 }).toInt(),
  check('address').exists().isString().trim(),
  check('products').exists().isArray({ min: 1 }),
  check('products.*.quantity').exists().isInt({ min: 1 }),
  check('products.*.productId').exists().isInt().toInt(),
  check('products').custom(checkProductsAvailibity)
]

// DONE: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// TODO: 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
  check('restaurantId').not().exists(),
  check('address').exists().isString().trim(),
  check('products').exists().isArray({ min: 1 }),
  check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
  check('products.*.productId').exists().isInt().toInt(),
  check('products').custom(checkProductsAvailibity)
]

export { create, update }
