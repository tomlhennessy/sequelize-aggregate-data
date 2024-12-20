// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');


// Import the models used in these routes - DO NOT MODIFY
const { Cat, Toy, sequelize } = require('./db/models');
const { Op } = require("sequelize");


// Express using json - DO NOT MODIFY
app.use(express.json());




// STEP 1: Load the toys and find the count, min price, max price, and sum
app.get('/toys', async (req, res, next) => {

    // A. Create an `allToys` variable that returns all toys
    const allToys = await Toy.findAll();

    // B. Create a `toysCount` variable that returns the total number of toy
    // records
    const toysCount = await Toy.count();

    // C. Create a `toysMinPrice` variable that returns the minimum price of all
    // the toys
    const toysMinPrice = await Toy.min('price');

    // D. Create a `toysMaxPrice` variable that returns the maximum price of all
    // the toys
    const toysMaxPrice = await Toy.max('price');

    // E. Create a `toysSumPrice` variable that returns the sum of all of
    // the toy prices.
    const toysSumPrice = await Toy.sum('price');

    res.json({
        toysCount,
        toysMinPrice,
        toysMaxPrice,
        toysSumPrice,
        allToys
    });
});




// STEP 2a: Find a cat with their associated toys, and aggregate toy data
app.get('/cats/:id/toys', async (req, res, next) => {

    const catToysAggregateData = await Cat.findByPk(req.params.id, {
        include: {
            model: Toy,
            attributes: []
        },
        attributes: [
            // Count all of this cat's toys, and display the value with a
            // key of `toyCount`
            [sequelize.fn('COUNT', sequelize.col('Toys.id')), 'toyCount'],

            // Find the average price of this cat's toys, and display the
            // value with a key of `averageToyPrice`
            [sequelize.fn('AVG', sequelize.col('Toys.price')), 'averageToyPrice'],

            // Find the total price of this cat's toys, and display the
            // value with a key of `totalToyPrice`
            [sequelize.fn('SUM', sequelize.col('Toys.price')), 'totalToyPrice']
        ],
        raw: true
    });

    const cat = await Cat.findByPk(req.params.id, {
        include: { model: Toy }
    });


    // STEP 2b: Format the cat object to add the aggregate keys and values to it

    // Define a new variable, `catData`, and set it equal to the `cat` variable converted to JSON
   const catData = cat.toJSON();

    // Add the `toyCount`, `averageToyPrice`, and `totalToyPrice` keys to the
    // catData object, with their aggregate values from `catToysAggregateData`
    catData.toyCount = catToysAggregateData.toyCount;
    catData.averageToyPrice = catToysAggregateData.averageToyPrice;
    catData.totalToyPrice = catToysAggregateData.totalToyPrice;


    // After the steps above are complete, refactor the line below to only
    // display `catData`
    res.json({catData});
})



// BONUS STEP: Create an endpoint for GET /data-summary that includes a summary
// of all the aggregate data according to spec
app.get('/data-summary', async (req, res, next) => {
    // aggregate data for all toys
    const toysCount = await Toy.count();
    const toysMinPrice = await Toy.min('price');
    const toysMaxPrice = await Toy.max('price');
    const toysSumPrice = await Toy.sum('price');
    const toysAvgPrice = await Toy.findAll({
        attributes: [[sequelize.fn('AVG', sequelize.col('price')), 'averagePrice']],
        raw: true
    }).then(data => data[0].averagePrice);

    // aggregate data for all cats
    const catsCount = await Cat.count();

    // respond with data summary
    res.json({
        dataSummary: {
            toys: {
                count: toysCount,
                minPrice: toysMinPrice,
                maxPrice: toysMaxPrice,
                sumPrice: toysSumPrice,
                avgPrice: parseFloat(toysAvgPrice) // parse average as a float
            },
            cats: {
                count: catsCount
            }
        }
    })
})



// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
    res.json({
        message: "API server is running"
    });
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 5001;
app.listen(port, () => console.log('Server is listening on port', port));
