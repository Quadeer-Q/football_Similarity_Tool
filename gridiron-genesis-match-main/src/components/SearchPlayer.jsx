
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from 'axios'

const SearchPlayer = ({ position, onSelect  }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Player, setPlayer] = useState("_");

  // Enhanced mock player data with more positions
  // useEffect(() => {
  //   const mockPlayersByPosition = {
  //     "gk": ["Alisson Becker", "Ederson", "David De Gea", "Manuel Neuer", "Jan Oblak", "Thibaut Courtois"],
  //     "rb": ["Trent Alexander-Arnold", "Reece James", "João Cancelo", "Achraf Hakimi", "Kyle Walker", "Dani Carvajal"],
  //     "lb": ["Andrew Robertson", "Alphonso Davies", "Theo Hernández", "Ferland Mendy", "Marcos Alonso", "Luke Shaw"],
  //     "cb": ["Virgil van Dijk", "Sergio Ramos", "Thiago Silva", "Kalidou Koulibaly", "Rúben Dias", "Marquinhos"],
  //     "dm": ["Casemiro", "N'Golo Kanté", "Rodri", "Fabinho", "Joshua Kimmich", "Sergio Busquets"],
  //     "cm": ["Kevin De Bruyne", "Luka Modrić", "Toni Kroos", "Bruno Fernandes", "Frenkie de Jong", "İlkay Gündoğan"],
  //     "am": ["Mason Mount", "Bernardo Silva", "Phil Foden", "Martin Ødegaard", "Kai Havertz", "James Maddison"],
  //     "rw": ["Mohamed Salah", "Jadon Sancho", "Riyad Mahrez", "Bukayo Saka", "Federico Chiesa", "Ousmane Dembélé"],
  //     "lw": ["Neymar Jr", "Sadio Mané", "Raheem Sterling", "Eden Hazard", "Son Heung-min", "Vinicius Junior"],
  //     "cf": ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Kylian Mbappé", "Erling Haaland", "Karim Benzema"]
  //   };

  //   // Backward compatibility with old position naming
  //   const compatibilityMap = {
  //     "def": [...mockPlayersByPosition.rb, ...mockPlayersByPosition.lb, ...mockPlayersByPosition.cb],
  //     "mid": [...mockPlayersByPosition.dm, ...mockPlayersByPosition.cm, ...mockPlayersByPosition.am],
  //     "fwd": [...mockPlayersByPosition.rw, ...mockPlayersByPosition.lw, ...mockPlayersByPosition.cf]
  //   };

  //   // Simulate an API call with a small delay
  //   setLoading(true);
  //   const timer = setTimeout(() => {
  //     // Use either the specific position or compatibility mapping
  //     const positionData = mockPlayersByPosition[position] || compatibilityMap[position] || [];
  //     setSearchResults(positionData);
  //     setLoading(false);
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [position]);




useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:3000/api/positions', { position });
      const data = response.data;

      // Fallback structure for compatibility
      

      const positionData = data.players || {};
      setSearchResults(positionData);
    } catch (error) {
      console.error('Error fetching players by position:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [position]);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:3000/api/analyze', { "position": position, "player_name": Player });
      const data = response.data.fingerprint;

      // console.log(data);

      
      

      
    } catch (error) {
      console.error('Error fetching players by position:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [onSelect]);


  const filteredPlayers = searchQuery.trim() !== "" 
    ? searchResults.filter(player => 
        player.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchResults;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Select Player</label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a player..."
            className="pl-8 bg-[#121212] border-[#333333] text-white placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-[#333333] rounded-md max-h-[200px] overflow-y-auto bg-[#121212]">
        {loading ? (
          <div className="text-center py-4 text-sm text-gray-400">Loading players...</div>
        ) : filteredPlayers.length > 0 ? (
          <ul className="divide-y divide-[#333333]">
            {filteredPlayers.map((player) => (
              <li key={player}>
                <button
                  type="button"
                  onClick={() =>{
                    onSelect(player);
                     setPlayer(player);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#1a1a1a] transition-colors text-sm text-white"
                >
                  {player}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-sm text-gray-400">
            {searchQuery ? "No players found" : "No players available"}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPlayer;
