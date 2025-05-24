/**
 * Fetch an image and current team for a player from Wikipedia
 * @param {string} playerName - The name of the player
 * @returns {Promise<{imageUrl: string|null, team: string|null}>} - The URL of the player's image and current team
 */
export const fetchWikipediaImage = async (playerName) => {
  try {
    // Convert the player name to a Wikipedia-friendly format
    const searchTerm = playerName.replace(/ /g, "%20");
    
    // First, search for the player's Wikipedia page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}%20footballer&format=json&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.query.search.length) {
      console.info(`No Wikipedia page found for ${playerName}`);
      return { imageUrl: null, team: null };
    }
    
    // Get the title of the first search result
    const pageTitle = searchData.query.search[0].title;
    const encodedTitle = encodeURIComponent(pageTitle);
    
    // Now fetch the page information to get the image
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodedTitle}&pithumbsize=500&format=json&origin=*`;
    
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    // Extract the image URL from the response
    const pages = pageData.query.pages;
    const pageId = Object.keys(pages)[0];
    
    let imageUrl = null;
    if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
      imageUrl = pages[pageId].thumbnail.source;
    }
    
    // Get page content for team info
    const infoboxUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&prop=text&section=0&format=json&origin=*`;
    
    const infoboxResponse = await fetch(infoboxUrl);
    const infoboxData = await infoboxResponse.json();
    
    let team = null;
    if (infoboxData.parse && infoboxData.parse.text) {
      const content = infoboxData.parse.text["*"];
      
      // Create a temporary element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Look for current club in the infobox
      const currentClubLabels = Array.from(tempDiv.querySelectorAll('th')).filter(
        th => th.textContent.includes('Current team') || th.textContent.includes('Club')
      );
      
      if (currentClubLabels.length > 0) {
        const clubCell = currentClubLabels[0].nextElementSibling;
        if (clubCell) {
          // Try to find link text first as it's usually the team name without extras
          const clubLink = clubCell.querySelector('a');
          if (clubLink) {
            team = clubLink.textContent.trim();
          } else {
            // Otherwise use cell text and clean it
            team = clubCell.textContent.trim();
            // Remove citation numbers and clean up
            team = team.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
          }
        }
      }
      
      // If we couldn't find from infobox, look for phrases in the text
      if (!team) {
        const paragraphs = tempDiv.querySelectorAll('p');
        for (const p of paragraphs) {
          const text = p.textContent;
          
          // Common patterns for describing current team
          const patterns = [
            /plays for ([^.]+)/i,
            /plays as a [^..]+ for ([^.]+)/i,
            /currently plays for ([^.]+)/i,
            /joined ([^.]+)/i,
            /signed for ([^.]+)/i
          ];
          
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              team = match[1].trim();
              // Clean up the team name
              team = team.replace(/\[\d+\]/g, '').split(' on loan')[0].split(' until')[0].trim();
              break;
            }
          }
          
          if (team) break;
        }
      }
    }
    
    console.log(`Found team for ${playerName}:`, team);
    return { imageUrl, team };
  } catch (error) {
    console.error(`Error fetching info for ${playerName}:`, error);
    return { imageUrl: null, team: null };
  }
};
