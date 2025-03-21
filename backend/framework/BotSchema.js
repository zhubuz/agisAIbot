/* eslint-disable no-invalid-this */
/* eslint-disable callback-return */
/* eslint-disable no-underscore-dangle */
/*jslint node:true*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    LEAN = 'lean',
    BotSchema = function (props) {
        'use strict';
        let baseSchema,
            injectLeanOption;
        const nochangeCollectionHash = {
            QrCode: true
        }
        props.btId = {type: String, default: ''};
        props.CreatedBy = {type: String};
        props.CreatedDate = {type: Number, default: Date.now};
        props.ModifiedBy = {type: String};
        props.ModifiedDate = {type: Number, default: Date.now};
        baseSchema = new Schema(props, {
            _id: true,
            autoIndex: false
        });
        injectLeanOption = function (mongooseObject) {
            var mLeanOptions = Object.keys(mongooseObject._mongooseOptions).some(function (item) {
                return item === LEAN && !mongooseObject._mongooseOptions[LEAN];
            });
            if (!mLeanOptions) {
                mongooseObject._mongooseOptions.lean = true;
            }
        };
        baseSchema.index({btId: 1}, {unique: false});
        baseSchema.set('toJSON', {
            virtuals: true
        });
        // baseSchema.pre('save', function (next) {
        //     // eslint-disable-next-line consistent-this
        //     var self = this;
        //     self.validate(function (error) {
        //         let now = Date.now();
        //         if (error) {
        //             next(error);
        //         } else {
        //             if (self.isNew) {
        //                 self._doc._id = new mongoose.Types.ObjectId();
        //                 self._doc.CreatedDate = self._doc.CreatedDate || now;
        //                 self._doc.ModifiedDate = self._doc.ModifiedDate || now;
        //                 self._doc.ModifiedBy = self._doc.ModifiedBy || self._doc.CreatedBy;
        //             } else if (self.ModifiedDate) {
        //                 self.ModifiedDate = now;
        //             }
        //             next();
        //         }
        //     });
        // });
        baseSchema.pre('findOneAndUpdate', function (next) {
            this.options.runValidators = true;
            if (!nochangeCollectionHash[this.mongooseCollection.name]) {
                this.updateOne({}, {
                    $set: {
                        ModifiedDate: Date.now()
                    }
                });
            }
            next();
        });
        baseSchema.pre('update', function (next) {
            this.options.runValidators = true;
            if (!nochangeCollectionHash[this.mongooseCollection.name]) {
                this.updateMany({}, {
                    $set: {
                        ModifiedDate: Date.now()
                    }
                });
            }
            next();
        });
        baseSchema.pre('updateOne', function (next) {
            this.options.runValidators = true;
            if (!nochangeCollectionHash[this.mongooseCollection.name]) {
                this.updateOne({}, {
                    $set: {
                        ModifiedDate: Date.now()
                    }
                });
            }
            next();
        });
        baseSchema.post('update', function (data) {
            //With upgrade to MongoDB Driver 2.0, update methods now return
            //raw mongodb server result instead of the number of records affected
            //For backward compability I am changing the result format
            data.result = data.n || data.result.n;
        });
        baseSchema.pre('findOneAndUpdate', function () {
            injectLeanOption(this);
        });
        baseSchema.pre('findOne', function () {
            injectLeanOption(this);
        });
        baseSchema.pre('find', function () {
            injectLeanOption(this);
        });
        return baseSchema;
    };
module.exports = BotSchema;