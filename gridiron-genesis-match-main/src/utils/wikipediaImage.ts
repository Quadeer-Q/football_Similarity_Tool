
/**
 * Utility function to fetch player images from Wikipedia API
 */

const fetchWikipediaImage = async (playerName: string): Promise<string | null> => {
  try {
    // First, search for the page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      playerName
    )}&format=json&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.query.search.length) {
      console.log(`No Wikipedia page found for ${playerName}`);
      return null;
    }
    
    const pageTitle = searchData.query.search[0].title;
    
    // Then get page images
    const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      pageTitle
    )}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    
    const imageResponse = await fetch(imagesUrl);
    const imageData = await imageResponse.json();
    
    const pages = imageData.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
      return pages[pageId].thumbnail.source;
    }
    
    console.log(`No image found for ${playerName} on Wikipedia`);
    return null;
  } catch (error) {
    console.error(`Error fetching Wikipedia image for ${playerName}:`, error);
    return null;
  }
};

export { fetchWikipediaImage };
