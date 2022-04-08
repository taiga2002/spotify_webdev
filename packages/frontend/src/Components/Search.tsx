import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Input, VStack } from '@chakra-ui/react';
import { SearchItem, SearchItemProps } from './SearchItem';

const Search = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (searchText !== '') {
        // TODO: Phase 2: Make the Search API call to our node backend
        // NOT the actual spotify API
        // the node backend will call the spotify API
        const params: SpotifyApi.SearchForItemParameterObject = {
          q: searchText,
          type: 'track',
          limit: 5,
        };
        axios.get('/myApi/search',{
          params: {
            ...params
          }
        })
        .then(({data})=>{
          console.log(data);
          setSearchResults(data);
          setLoading(false);
        })
        .catch((err)=>console.log(err));
      }
    };
    fetchData();
  }, [searchText]);

  return (
    <VStack>
      <Input
        variant="filled"
        placeholder="Search for a song"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          // TODO: Phase 2: Update searchText state
          setSearchText(e.target.value);
        }}
      />
      {searchResults && !loading ? (
        <>
          {searchResults.map((trackInfo, index) => (
            <SearchItem key={index} {...trackInfo} />
          ))}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </VStack>
  );
};

export default Search;
