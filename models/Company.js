const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type : String,
        required : [true, 'Please add a name'],
        unique : true,
        trim : true,
        maxlength : [50, 'Name can not be more than 50 characters']
    },
    address: {
        type : String,
        required : [true, 'Please add an address']
    },
    district: {
        type : String,
        required : [true, 'Please add a district']
    },
    province: {
        type : String,
        required : [true, 'Please add a province']
    },
    postalcode: {
        type : String,
        required : [true, 'Please add a postal code'],
        maxlength : [5, 'Postal code can not be more than 5 digits']
    },
    tel : {
        type : String,
    },
    region : {
        type : String,
        required : [true, 'Please add a region']
    },
} , {
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
});

// Cascade delete appointments when a hospital is deleted
CompanySchema.pre('deleteOne',{document:true,query:false} ,async function(next){
    console.log(`Bookings being removed from company ${this._id}`);
    await this.model('Booking').deleteMany({company : this._id});
    next();
});

// Reverse populate with virtuals
CompanySchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

module.exports = mongoose.model('Company', CompanySchema);