import './App.css';
import React, { useEffect, useState } from 'react';
import ScaleLoader from "react-spinners/ScaleLoader";

function App() {

  const [countries, setCountries] = useState([]);
  const [infoCountry, setInfoCountries] = useState({});
  const [countryDetail, setCountryDetail] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/countries')
      .then(response => response.json())
      .then(data => setCountries(data))
      .catch(error => console.error('Error fetching countries:', error));

  }, []);



  const countrySelected = async (countrySelected) => {

    const CountrySelectedCode = countrySelected.countryCode
    const namecode = countrySelected.name
    const nameBorderCode = countrySelected.commonName

    setCountryDetail(true)
    setLoader(true)


    try {
      const response = await fetch('http://localhost:5000/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ countryCode: CountrySelectedCode, namecode: namecode, nameBorderCode: nameBorderCode })
      });



      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      fetch('http://localhost:5000/info')
        .then(response => response.json())
        .then(data => setInfoCountries(data))
        .catch(error => console.error('Error fetching countries:', error));



    } catch (err) {
      console.error('Error fetching country info:', err);
    } finally {
      setTimeout(() => {
        setLoader(false);
      }, 2000);
    }

  }





  const borderCountries = infoCountry?.countryInfo?.borders || [];
  const ArrayPopulationDate = infoCountry?.population?.data?.populationCounts || [];
  const flagurl = infoCountry?.flag?.data?.flag || '';


  return (

    <div style={{ height: loader ? "100vh" : "100%" }}>

      {loader ? (<ScaleLoader loading={loader} color='rgba(0, 0, 0, 0.8)' className='spinner' />) : (

        <>

          <button className={!countryDetail ? "buttonBackOff" : "buttonBackOn"} onClick={() => setCountryDetail(false)}>Atras</button>

          <div className={!countryDetail ? "listOfCountriesOn" : "listOfCountriesOff"}>
            <h1 className='title-list-countries'>List of Countries</h1>
            <ul className='listCountries'>
              {countries.map((country, index) => (
                <li className='items-countries' onClick={() => countrySelected(country)} key={index}>
                  {country.name} - {country.countryCode}
                </li>
              ))}
            </ul>

          </div>

          <section className={countryDetail ? "countryDetailsOn" : "countryDetailsOff"}>

            {infoCountry?.countryInfo?.officialName && infoCountry?.countryInfo?.region && (
              <>
                <h1 className='title-info-countries'>{infoCountry.countryInfo.officialName} - {infoCountry.countryInfo.region}</h1>
              </>
            )}


            <ul>

              {/* Conditional to show the flag only if it exists */}
              {flagurl && (
                <div className='container-flag'>
                  <img className='flag' src={flagurl} alt="flag" />
                </div>
              )}

              {/* Conditional to show population only if `ArrayPopulationDate` is not empty */}
              {ArrayPopulationDate.length > 0 && (
                <>
                  <h1 className='title-info-countries'>Population of Country</h1>

                  <ul className='listCountries'>
                    {ArrayPopulationDate.map((population, index) => (

                      <li>
                        Population: {population.value} - Year: {population.year}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Conditional to show border countries only if `borderCountries` is not empty */}
              {borderCountries.length > 0 && (
                <>
                  <h1 className='title-info-countries'>Border of Country</h1>

                  <ul className='listBorderCountries'>
                    {borderCountries.map((borderCountry, index) => (
                      <li style={{ cursor: 'pointer' }} onClick={() => countrySelected(borderCountry)} key={index}>
                        Name: {borderCountry.officialName} - Region: {borderCountry.region}
                      </li>
                    ))}
                  </ul>
                </>
              )}

            </ul>

          </section>

        </>
      )
      }

    </div>
  );
}

export default App;
