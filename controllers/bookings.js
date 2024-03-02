const Booking = require('../models/Booking');
const Company = require('../models/Company');
//@desc Get all appointments
//@route GET /api/v1/appointments
//@access Public
exports.getBookings = async(req,res,next)=>{
    let query;
    
    // General user can see only their appointments!
    if(req.user.role !== 'admin'){
        query = Booking.find({user: req.user.id}).populate({
            path: 'company',
            select: 'name province tel'
        });
    } else { // Admin can see all appointments
        
        if(req.params.companyId){
            console.log(req.params.companyIdId);
            query = Booking.find({company: req.params.companyId}).populate({
                path: 'company',
                select: 'name province tel'
            });
        } else {
            query = Booking.find().populate({
                path: 'company',
                select: 'name province tel'
            });
        }
    }
    try {
        const bookings = await query;
        res.status(200).json({
            success:true, 
            count:bookings.length, 
            data:bookings
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message : "Can not find Booking"})
    }
};

//@desc Get single appointment
//@route GET /api/v1/appointments/:id
//@access Public
exports.getBooking = async(req,res,next)=>{
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'company',
            select: 'name description tel'
        });
        if(!booking){
            return res.status(404).json({success:false, message : `No booking with the id of ${req.params.id}`})
        }
        res.status(200).json({
            success:true, 
            data:booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message : "Cannot find Booking"})
    }
};

//@desc Add appointment
//@route POST /api/v1/appointments
//@access Private
exports.addBooking = async(req,res,next)=>{
    try {
        req.body.company = req.params.companyId;
        
        const company = await Company.findById(req.params.companyId);

        if(!company){
            return res.status(404).json({success:false, 
                message : `No company with the id of ${req.params.companyId}`
            });
        }

        //Book date invalid
        const bookDate = new Date(req.body.bookDate);

        if(bookDate >= new Date("2022-05-14T00:00:00.000Z") || bookDate < new Date("2022-05-10T00:00:00.000Z")){
            return res.status(400).json({success:false, 
                message : "Date must be between 10-13th May"
            });
        }

        // add user Id to req.body
        req.body.user = req.user.id;
        
        // Check for existed appointment
        const existedBookings = await Booking.find({ user: req.user.id });

        // If the user is not an admin, they can only create 3 appointment.
        if (existedBookings.length >= 3 && req.user.role !== 'admin' ) {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made 3 bookings` });
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({
            success:true, 
            data:booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message : "Cannot create Booking"})
    }

   
}

//@desc Update appointment
//@route PUT /api/v1/appointments/:id
//@access Private
exports.updateBooking = async(req,res,next)=>{
    try {
        let booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success:false, message : `No booking with the id of ${req.params.id}`})
        }

        // Make sure user is appointment owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, message : `User ${req.user.id} is not authorized to update this booking`})
        }

        booking = await Booking.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        });
        res.status(200).json({
            success:true, 
            data:booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message : "Cannot update Booking"})
    }
}

//@desc Delete appointment
//@route DELETE /api/v1/appointments/:id
//@access Private
exports.deleteBooking = async(req,res,next)=>{
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success:false, message : `No booking with the id of ${req.params.id}`})
        }

        // Make sure user is appointment owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, message : `User ${req.user.id} is not authorized to delete this booking`})
        }

        await booking.deleteOne();

        res.status(200).json({
            success:true, 
            data:{}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message : "Cannot delete Booking"})
    }
}