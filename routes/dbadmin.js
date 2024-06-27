var express = require('express');
var router = express.Router();
var auth = require('./rules/authCheck');
var role = require('./rules/roleCheck')
var pool = require('../database/queries')

function formatDate(date) {
    if (!date) return null; // Handle empty or undefined date inputs

    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
        throw new Error('Invalid date format');
    }

    return formattedDate.toISOString().split('T')[0];
}


router.get("/export-db", /* role.dbadmin ,*/ async (req, res) => {
    
    const fields = ["airtemp", "airhum", "windspeed"];
    const imei = '868715034995740'
    const startDate = "2023-01-01"
    const endDate = "2024-03-04"

    pool.getDataByImeiAndDateRange(imei, startDate, endDate, fields)
      .then(data => console.log(data))
      .catch(error => console.error(error));
    
    res.status(200).json({ message: 'DBADMIN is valid' });
  
} )



router.post("/export-db", /* role.dbadmin ,*/ async (req, res) => {
    // Extract parameters from the request body
    var { imei, startDate, endDate, fields } = req.body;
    
    imei = JSON.parse(imei)
    
        fields = fields.map(item => item.code);
    
    console.log(fields)

    // Validate input for imei and fields
    

    // Format dates to YYYY-MM-DD format
    let queryStartDate, queryEndDate;
    try {
        queryStartDate = formatDate(startDate || new Date(new Date().setDate(new Date().getDate() - 1)));
        queryEndDate = formatDate(endDate || new Date());
    } catch (error) {
        return res.status(400).json({ error: 'Invalid date format' });
    }

    // Example default fields if not provided in request body
    const defaultFields = ["airtemp", "airhum", "windspeed"];

    // Use default fields if fields are not provided in request body
    const queryFields = ['imei', ...(fields || defaultFields)];

    try {
        const data = await pool.getDataByImeiAndDateRange(imei, queryStartDate, queryEndDate, queryFields);
        console.log(data); // Logging data to console for testing

        res.status(200).json({ message: 'Data retrieved successfully', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




module.exports = router;
