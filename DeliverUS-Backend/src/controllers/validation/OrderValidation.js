// ONIT: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

import { check } from 'express-validator'
import { checkProducts, checkProductsAvailability, checkProductsSameRestaurant} from '../../middlewares/ProductMiddleware'//TENGO K HACERLO OLA
import { checkRestaurantExists } from '../../middlewares/OrderMiddleware'

const create = [
    check('restaurantId').exists().isInt({ min: 1 }).toInt().custom(checkRestaurantExists),
    check('products').exists().isArray({ min: 1 }).custom(checkProducts),
    check('products').custom(checkProductsSameRestaurant),
    check('products.*.quantity').isInt({ min: 1 }),
    check('products').custom(checkProductsAvailability),
    check('products').custom(checkProductRestaurantOwnership),
    check('products').custom(checkProductsAvailability)

    ]
// ONIT: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
    check('restaurantId').not().exists(),
    check('products').exists().isArray({ min: 1 }) .custom(checkProducts),

]

export { create, update }
