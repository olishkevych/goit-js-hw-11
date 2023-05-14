export function fetchCountries(searchQuery) {
  const searchFields = 'name,capital,population,flags,languages';
  return fetch(
    `https://restcountries.com/v3.1/name/${searchQuery}??fullText=false&fields=${searchFields}`
  ).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}
