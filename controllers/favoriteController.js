const favoriteModel = require('../models/favorite-model')
const utilities = require('../utilities/')

/* ***************************
 * Build favorites view
 * ************************** */
async function buildFavorites(req, res, next) {
    try {
        const account_id = res.locals.accountData.account_id
        const favorites = await favoriteModel.getFavoritesByAccountId(account_id)
        let nav = await utilities.getNav()
        
        res.render('./account/favorites', {
            title: 'My Favorites',
            nav,
            favorites: favorites.rows,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Toggle favorite status
 * ************************** */
async function toggleFavorite(req, res, next) {
    try {
        const account_id = res.locals.accountData.account_id
        const inventory_id = parseInt(req.params.inventory_id)
        const isFavorite = await favoriteModel.isFavorite(account_id, inventory_id)
        
        if (isFavorite) {
            await favoriteModel.removeFavorite(account_id, inventory_id)
            req.flash('notice', 'Vehicle removed from favorites')
        } else {
            await favoriteModel.addFavorite(account_id, inventory_id)
            req.flash('notice', 'Vehicle added to favorites')
        }
        
        res.redirect(req.get('referer') || '/account/favorites')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    buildFavorites,
    toggleFavorite
} 