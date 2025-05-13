const User = require("../models/User");
const Income = require("../models/Income");



//add income source
exports.addIncome = async(req, res)=>{
    const userId = req.user.id;
    try{
        const {icon, source, amount, date}= req.body;

        //validtaion for missing fields
        if (!source || !amount ||!date){
            return res.status(400).json({message: "All fields are required."});
        }

        const newIncome = new Income({
            userId, icon, source, amount, date: new Date(date)
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }

}


//get all income source
exports.getAllIncome = async(req, res)=>{}




//delete income source
exports.deleteIncome = async(req, res)=>{}



//download excel file
exports.downloadIncomeExcel = async(req, res)=>{}