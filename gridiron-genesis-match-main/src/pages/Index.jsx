
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, Users } from "lucide-react";
import PlayerComparisonView from "@/components/PlayerComparisonView";
import SearchPlayer from "@/components/SearchPlayer";

const positions = [
  { value: "attacking_midfield", label: "Attacking Midfield" },
  { value: "central_forward", label: "Central Forward" },
  { value: "central_midfield", label: "Central Midfield" },
  { value: "centre-back", label: "Center Back" },
  { value: "defensive_midfield", label: "Defensive Midfielder" },
  { value: "left_winger", label: "Left Winger" },
  { value: "left_back", label: "Left Back" },
  { value: "right_back", label: "Right Back" },
  { value: "right_winger", label: "Right Winger" }
];

const Index = () => {
  const [selectedPosition, setSelectedPosition] = useState("");
  const [sourcePlayer, setSourcePlayer] = useState(null);
  const [comparisonActive, setComparisonActive] = useState(false);
  const [selectedPlayerCard, setSelectedPlayerCard] = useState(null);

  const handlePositionChange = (value) => {
    setSelectedPosition(value);
    setComparisonActive(false);
    toast({
      title: "Position Selected",
      description: `Player position set to ${positions.find(p => p.value === value)?.label}`,
    });
  };

  const handlePlayerSelect = (player) => {
    setSourcePlayer(player);
    setComparisonActive(false);
  };

  const startComparison = () => {
    if (!selectedPosition || !sourcePlayer) {
      toast({
        title: "Missing Information",
        description: "Please select both a position and a player to compare",
        variant: "destructive"
      });
      return;
    }
    
    setComparisonActive(true);
    toast({
      title: "Comparison Started",
      description: "Finding similar players...",
    });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <header className="bg-gradient-to-r from-[#FF1E56] to-[#2F6EFF] text-white py-6 px-8 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">Player Similarity Tool</h1>
          <p className="mt-2 text-lg text-gray-200">Flaunt your footy knowledge</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 bg-[#121212] border-[#1B1F64]">
            <CardHeader>
              <CardTitle className="text-white">Select Parameters</CardTitle>
              <CardDescription className="text-[#555555]">Choose a player position and select a player to find similar players</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Position</label>
                <Select onValueChange={handlePositionChange} value={selectedPosition}>
                  <SelectTrigger className="bg-[#121212] border-[#1B1F64] text-white">
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-[#1B1F64] text-white">
                    {positions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPosition && (
                <SearchPlayer position={selectedPosition} onSelect={handlePlayerSelect} />
              )}
              
              <Separator className="bg-[#1B1F64]" />
              
              <Button 
                onClick={startComparison} 
                disabled={!selectedPosition || !sourcePlayer} 
                className="w-full bg-gradient-to-r from-[#FF1E56] to-[#2F6EFF] hover:opacity-90 border-none text-white"
              >
                Compare Players <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2 bg-[#121212] border-[#1B1F64]">
            {comparisonActive ? (
              <PlayerComparisonView 
                player={sourcePlayer} 
                position={selectedPosition}
                selectedPlayerCard={selectedPlayerCard}
                setSelectedPlayerCard={setSelectedPlayerCard}
              />
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center text-[#555555]">
                  <Users className="mx-auto h-16 w-16 mb-4 opacity-30" />
                  <h3 className="text-xl font-medium mb-2">No Comparison Active</h3>
                  <p>Select a player position and player, then click Compare Players</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
