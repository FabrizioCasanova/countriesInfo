const express = require('express');
require('dotenv').config();
const app = express();

const port = process.env.PORT;
const apiUrlAvailableCountries = process.env.API_URL;
const apiUrlIsoResponse = process.env.API_ISO_URL

app.use(express.json());

// Middleware to allow CORS requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let codigo = ''
let namecode = ''
let nameBorderCode = ''

app.post('/info', (req, res) => {

  //Get the data from the request body
  codigo = req.body.countryCode

  namecode = req.body.namecode

  nameBorderCode = req.body.nameBorderCode

  res.status(200).json({ message: 'Información recibida correctamente' });

})


// Route to get countries from an external API
app.get('/api/countries', async (req, res) => {

  try {
    const response = await fetch(`${apiUrlAvailableCountries}/AvailableCountries`);
    const data = await response.json();  // Convert the response to JSON
    res.json(data);  // Send the data to the frontend

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los países' });  // Error handling
  }
});

// Obtain the ISO3 of the country to be able to search for the population





app.get('/info', async (req, res) => {

  try {
    // Determine whether to use namebordercode or namecode
    const country = nameBorderCode && nameBorderCode.trim() !== "" ? nameBorderCode : namecode;

    // Wait for the fetch to complete to get the ISO3 code
    const isoResponse = await fetch(`${apiUrlIsoResponse}/countries/iso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: country, // Use conditional variable here
      }),
    });

    let codecountry = null; // Initialize variable for ISO3 code

    if (isoResponse.ok) {

      const isoData = await isoResponse.json();

      if (isoData.data && isoData.data.Iso3) {
        codecountry = isoData.data.Iso3; // Save the ISO3 code
      } else {
        console.warn('No se encontró el código ISO3 para este país.');
      }
    } else {
      console.warn('Error al buscar el código ISO3, continuar sin la info de población.');
    }

    // Generate the other requests in parallel (no population if there is no ISO3)
    const requests = [
      fetch(`${apiUrlAvailableCountries}/CountryInfo/${codigo}`), //Make sure 'code' is well defined
      fetch(`${apiUrlIsoResponse}/countries/flag/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iso2: codigo, //Use the ISO2 code
        }),
      }),
    ];

    // Only add the population request if the ISO3 code was found
    if (codecountry) {
      requests.push(fetch(`${apiUrlIsoResponse}/countries/population`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iso3: codecountry, // Use the newly obtained ISO3 code
        }),
      }));
    }

    // Run all requests in parallel
    const [countryInfoResponse, flagResponse, populationResponse] = await Promise.all(requests);

    // Convert responses to JSON
    const countryInfo = await countryInfoResponse.json();
    const flag = await flagResponse.json();
    const population = codecountry ? await populationResponse.json() : null;

    // Send the response, omitting the population if it was not obtained
    res.json({
      countryInfo,
      population: population || { message: 'No hay datos de población disponibles.' },
      flag,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error al obtener la información' });
  }
});



// Raise the server
app.listen(port, () => {
  console.log(`Backend corriendo en http://localhost:${port}`);
});

