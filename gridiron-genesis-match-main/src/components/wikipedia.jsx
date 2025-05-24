export const fetchWikipediaImage = async (playerName) => {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      playerName
    )}&format=json&origin=*`;
  
    try {
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const pageTitle = searchData.query.search[0]?.title;
      if (!pageTitle) return null;
  
      const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        pageTitle
      )}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
  
      const imageRes = await fetch(imageUrl);
      const imageData = await imageRes.json();
      const page = Object.values(imageData.query.pages)[0];
      return page?.thumbnail?.source || null;
    } catch (error) {
      console.error('Wikipedia image fetch failed:', error);
      return null;
    }
  };
  