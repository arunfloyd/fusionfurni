const mongoose = require('mongoose');

const offerAssociationSchema = new mongoose.Schema({
    associationType: {
        type: String,
        enum: ['Product', 'Category'],
        required: true,
    },
    associationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'associationType',
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true,
    },
});

const offerSchema = new mongoose.Schema({
    offer_name: {
        type: String,
        required: true,
        maxlength: 255,
        minlength: 1,
    },
    startingDate: {
        type: Date,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                return this.startingDate < this.expiryDate;
            },
            message: 'Starting date must be before expiry date.',
        },
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    status: {
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const OfferAssociation = mongoose.model('OfferAssociation', offerAssociationSchema);
const Offer = mongoose.model('Offer', offerSchema);

module.exports = { OfferAssociation, Offer };
