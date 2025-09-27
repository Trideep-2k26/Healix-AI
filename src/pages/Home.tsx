import React from 'react';
import Landing from './Landing';

// Home page acts as an alias/wrapper for Landing so that '/' renders the hero.
// Keep this lightweight; any future sections can be composed here.
const Home: React.FC = () => {
	return <Landing />;
};

export default Home;
