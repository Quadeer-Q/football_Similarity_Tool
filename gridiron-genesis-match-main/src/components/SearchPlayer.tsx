
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchPlayerProps {
  position: string;
  onSelect: (player: string) => void;
}

const SearchPlayer = ({ position, onSelect }: SearchPlayerProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Mock player data based on position
  // This would be replaced with actual API calls to your backend later
  useEffect(() => {
    const mockPlayersByPosition: Record<string, string[]> = {
      "gk": ["Alisson Becker", "Ederson", "David De Gea", "Manuel Neuer", "Jan Oblak", "Thibaut Courtois"],
      "def": ["Virgil van Dijk", "Sergio Ramos", "Thiago Silva", "Kalidou Koulibaly", "Trent Alexander-Arnold", "Alphonso Davies"],
      "mid": ["Kevin De Bruyne", "N'Golo Kanté", "Luka Modrić", "Toni Kroos", "Bruno Fernandes", "Casemiro"],
      "fwd": ["Lionel Messi", "Cristiano Ronaldo", "Robert Lewandowski", "Kylian Mbappé", "Erling Haaland", "Mohamed Salah"]
    };

    // Simulate an API call with a small delay
    setLoading(true);
    const timer = setTimeout(() => {
      setSearchResults(mockPlayersByPosition[position] || []);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [position]);

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
            className="pl-8 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-[#333333] rounded-md max-h-[200px] overflow-y-auto bg-[#1C1C1C]">
        {loading ? (
          <div className="text-center py-4 text-sm text-gray-400">Loading players...</div>
        ) : filteredPlayers.length > 0 ? (
          <ul className="divide-y divide-[#333333]">
            {filteredPlayers.map((player) => (
              <li key={player}>
                <button
                  onClick={() => onSelect(player)}
                  className="w-full text-left px-3 py-2 hover:bg-[#2A2A2A] transition-colors text-sm text-white"
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
