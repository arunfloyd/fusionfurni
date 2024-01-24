const mongoose = require('mongoose');

const productOfferSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    }
});

const categoryOfferSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    }
});

const offerSchema = new mongoose.Schema({
    offer_name: {
        type: String,
        required: true,
        maxlength: 255,
        minlength: 1
    },

    startingDate: {
        type: Date,
        required: true
    },

    expiryDate: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                return this.startingDate < this.expiryDate;
            },
            message: 'Starting date must be before expiry date.'
        }
    },

    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    status: {
        type: Boolean,
        default: function () {
            return true;
        }
    },

    description: {
        type: String,
        required: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const ProductOffer = mongoose.model('ProductOffer', productOfferSchema);
const CategoryOffer = mongoose.model('CategoryOffer', categoryOfferSchema);
const Offer = mongoose.model('Offer', offerSchema);

module.exports = { ProductOffer, CategoryOffer, Offer };
