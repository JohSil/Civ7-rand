import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Button,
  Stack,
  TextField,
  IconButton,
  Typography,
  Card,
  CardContent,
  Divider,
  createTheme,
  ThemeProvider,
  Box,
  Grid2,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  CIVILIZATIONS,
  DEFAULT_CIVILIZATIONS,
  DEFAULT_LEADERS,
  LEADERS,
} from "./constants/gameData";

export interface PlayerData {
  id: number;
  name: string;
  isEditing: boolean;
  selectedLeaders: string[];
  selectedCivs: string[];
  assignedLeaders: string[];
  assignedCivs: string[];
}

interface SelectionTabsProps {
  activePlayerIndex: number;
  setActivePlayerIndex: (index: number) => void;
  players: PlayerData[];
}

const SelectionTabs: React.FC<SelectionTabsProps> = ({
  activePlayerIndex,
  setActivePlayerIndex,
  players,
}) => (
  <Tabs
    value={activePlayerIndex}
    onChange={(event, newValue) => setActivePlayerIndex(newValue)}
  >
    <Tab label="Default" />
    {players.map((player) => (
      <Tab key={player.id} label={player.name} />
    ))}
  </Tabs>
);

interface DefaultSelectionProps {
  title: string;
  items: string[];
  selections: boolean[];
  toggleSelection: (index: number) => void;
}

const DefaultSelection: React.FC<DefaultSelectionProps> = ({
  title,
  items,
  selections,
  toggleSelection,
}) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" color="white">
      {title}:
    </Typography>
    <Grid2 container spacing={1}>
      {items.map((item, index) => (
        <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selections[index]}
                onChange={() => toggleSelection(index)}
              />
            }
            label={item}
          />
        </Grid2>
      ))}
    </Grid2>
  </Box>
);

interface PlayerSelectionProps {
  activePlayerIndex: number;
  players: PlayerData[];
  items: string[];
  getSelectedItems: (player: PlayerData) => string[];
  handleSelection: (
    playerId: number,
    item: string,
    isSelected: boolean
  ) => void;
}

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  activePlayerIndex,
  players,
  items,
  getSelectedItems,
  handleSelection,
}) => (
  <Box>
    {players.map((player, i) => (
      <div key={player.id} role="tabpanel" hidden={activePlayerIndex !== i + 1}>
        {activePlayerIndex === i + 1 && (
          <Box sx={{ p: 3 }}>
            <Grid2 container spacing={1}>
              {items.map((item) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={getSelectedItems(player).includes(item)}
                        onChange={(e) =>
                          handleSelection(player.id, item, e.target.checked)
                        }
                      />
                    }
                    label={item}
                  />
                </Grid2>
              ))}
            </Grid2>
          </Box>
        )}
      </div>
    ))}
  </Box>
);

function App() {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      text: {
        primary: "#ffffff",
        secondary: "#b3b3b3",
      },
    },
    components: {
      MuiFormControlLabel: {
        styleOverrides: {
          label: {
            color: "#ffffff",
          },
        },
      },
    },
  });

  const [defaultLeaderSelections, setDefaultLeaderSelections] = useState<
    boolean[]
  >(LEADERS.map((leader) => DEFAULT_LEADERS.includes(leader)));

  const [defaultCivSelections, setDefaultCivSelections] = useState<boolean[]>(
    CIVILIZATIONS.map((civ) => DEFAULT_CIVILIZATIONS.includes(civ))
  );
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [leaderCount, setLeaderCount] = useState(2);
  const [civCount, setCivCount] = useState(2);
  const [players, setPlayers] = useState<PlayerData[]>([]);

  const generateUniqueId = (players: PlayerData[]): number => {
    let newId = 1;

    if (players.length > 0) {
      newId = Math.max(...players.map((player) => player.id)) + 1;
    }

    return newId;
  };

  const addPlayer = () => {
    const newId = generateUniqueId(players);

    const newPlayer: PlayerData = {
      id: newId,
      name: `Player ${newId}`,
      isEditing: false,
      selectedLeaders: LEADERS.filter(
        (_, index) => defaultLeaderSelections[index]
      ),
      selectedCivs: CIVILIZATIONS.filter(
        (_, index) => defaultCivSelections[index]
      ),
      assignedLeaders: [],
      assignedCivs: [],
    };

    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (playerId: number) => {
    setPlayers(players.filter((player) => player.id !== playerId));
  };

  const toggleEditName = (playerId: number) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? { ...player, isEditing: !player.isEditing }
          : player
      )
    );
  };

  const updatePlayerName = (playerId: number, newName: string) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              name: newName || `Player ${playerId}`,
              isEditing: false,
            }
          : player
      )
    );
  };

  const handleLeaderSelection = (
    playerId: number,
    leader: string,
    isSelected: boolean
  ) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              selectedLeaders: isSelected
                ? [...player.selectedLeaders, leader]
                : player.selectedLeaders.filter((l) => l !== leader),
            }
          : player
      )
    );
  };

  const handleCivSelection = (
    playerId: number,
    civ: string,
    isSelected: boolean
  ) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              selectedCivs: isSelected
                ? [...player.selectedCivs, civ]
                : player.selectedCivs.filter((c) => c !== civ),
            }
          : player
      )
    );
  };

  const toggleDefaultLeader = (index: number) => {
    const newSelections = [...defaultLeaderSelections];
    newSelections[index] = !newSelections[index];
    setDefaultLeaderSelections(newSelections);
  };

  const toggleDefaultCiv = (index: number) => {
    const newSelections = [...defaultCivSelections];
    newSelections[index] = !newSelections[index];
    setDefaultCivSelections(newSelections);
  };

  const randomize = () => {
    // Reset all assignments first
    setPlayers(
      players.map((player) => ({
        ...player,
        assignedLeaders: [],
        assignedCivs: [],
      }))
    );

    // Create a pool of available leaders and civs for each player
    const playerPools = players.map((player) => ({
      id: player.id,
      leaderPool: [...player.selectedLeaders],
      civPool: [...player.selectedCivs],
    }));

    // Shuffle each player's pools
    playerPools.forEach((player) => {
      // Fisher-Yates shuffle algorithm
      for (let i = player.leaderPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [player.leaderPool[i], player.leaderPool[j]] = [
          player.leaderPool[j],
          player.leaderPool[i],
        ];
      }

      for (let i = player.civPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [player.civPool[i], player.civPool[j]] = [
          player.civPool[j],
          player.civPool[i],
        ];
      }
    });

    // Track used items to avoid duplicates
    const usedLeaders = new Set<string>();
    const usedCivs = new Set<string>();

    // Assign leaders and civs to each player
    const assignments = new Map<
      number,
      { leaders: string[]; civs: string[] }
    >();
    let allAssignmentsValid = true;

    for (const player of playerPools) {
      const assignedLeaders: string[] = [];
      const assignedCivs: string[] = [];

      // Try to assign leaders
      for (let i = 0; i < leaderCount; i++) {
        // Find an unused leader from this player's pool
        const availableLeader = player.leaderPool.find(
          (l) => !usedLeaders.has(l)
        );

        if (availableLeader) {
          assignedLeaders.push(availableLeader);
          usedLeaders.add(availableLeader);
        } else {
          allAssignmentsValid = false;
          break;
        }
      }

      // Try to assign civs
      for (let i = 0; i < civCount; i++) {
        // Find an unused civ from this player's pool
        const availableCiv = player.civPool.find((c) => !usedCivs.has(c));

        if (availableCiv) {
          assignedCivs.push(availableCiv);
          usedCivs.add(availableCiv);
        } else {
          allAssignmentsValid = false;
          break;
        }
      }

      assignments.set(player.id, {
        leaders: assignedLeaders,
        civs: assignedCivs,
      });

      if (!allAssignmentsValid) break;
    }

    if (allAssignmentsValid) {
      // Apply the assignments to players
      setPlayers(
        players.map((player) => ({
          ...player,
          assignedLeaders: assignments.get(player.id)?.leaders || [],
          assignedCivs: assignments.get(player.id)?.civs || [],
        }))
      );
    } else {
      alert(
        "Couldn't find valid combinations. Make sure each player has selected enough unique leaders and civilizations!"
      );
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div
        className="App"
        style={{
          padding: "24px",
          backgroundColor: "#121212",
          minHeight: "100vh",
        }}
      >
        <Stack spacing={2} maxWidth={1700} margin="0 auto">
          <Typography variant="h4" color="white" gutterBottom>
            Civilization VII Antiquity Randomizer
          </Typography>

          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addPlayer}
                disabled={players.length >= 8}
              >
                Add Player
              </Button>
              <TextField
                type="number"
                label="Leaders per player"
                value={leaderCount}
                onChange={(e) =>
                  setLeaderCount(Math.max(1, parseInt(e.target.value) || 1))
                }
                size="small"
                slotProps={{
                  htmlInput: {
                    min: 1,
                  },
                }}
                sx={{ width: 150 }}
              />
              <TextField
                type="number"
                label="Civs per player"
                value={civCount}
                onChange={(e) =>
                  setCivCount(Math.max(1, parseInt(e.target.value) || 1))
                }
                size="small"
                slotProps={{
                  htmlInput: {
                    min: 1,
                  },
                }}
                sx={{ width: 150 }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShuffleIcon />}
                onClick={randomize}
              >
                Randomize
              </Button>
            </Stack>

            {players.some((player) => player.assignedLeaders.length > 0) && (
              <Stack
                direction="row"
                sx={{
                  flexWrap: "wrap",
                  gap: 2,
                  margin: -1,
                  "& > *": { margin: 1 },
                }}
              >
                {players.map((player) => (
                  <Card
                    key={player.id}
                    sx={{
                      minWidth: 275,
                      flex: "1 1 300px",
                      maxWidth: "calc(50% - 16px)",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {player.name}
                      </Typography>
                      <Typography variant="subtitle1" color="primary">
                        Leaders:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {player.assignedLeaders.map((leader, index) => (
                          <React.Fragment key={leader}>
                            {leader}
                            {index < player.assignedLeaders.length - 1 && (
                              <br />
                            )}
                          </React.Fragment>
                        ))}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle1" color="primary">
                        Civilizations:
                      </Typography>
                      <Typography variant="body1">
                        {player.assignedCivs.map((civ, index) => (
                          <React.Fragment key={civ}>
                            {civ}
                            {index < player.assignedCivs.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            <Stack spacing={1}>
              {players.map((player) => (
                <Stack
                  key={player.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  {player.isEditing ? (
                    <>
                      <TextField
                        size="small"
                        defaultValue={player.name}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updatePlayerName(
                              player.id,
                              (e.target as HTMLInputElement).value
                            );
                          }
                        }}
                      />
                      <IconButton
                        onClick={() => {
                          const input = document.querySelector(
                            `input[value="${player.name}"]`
                          ) as HTMLInputElement;
                          updatePlayerName(player.id, input.value);
                        }}
                        size="small"
                      >
                        <CheckIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography color="white" sx={{ fontSize: "1rem" }}>
                        {player.name}
                      </Typography>
                      <IconButton
                        onClick={() => toggleEditName(player.id)}
                        size="small"
                        sx={{ color: "white" }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => removePlayer(player.id)}
                        size="small"
                        sx={{ color: "white" }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                </Stack>
              ))}
            </Stack>
          </Stack>

          <>
            <Tabs
              value={activeTab}
              onChange={(event, newValue) => setActiveTab(newValue)}
            >
              <Tab label="Leaders" />
              <Tab label="Civilizations" />
            </Tabs>

            {/* Leaders Section */}
            {activeTab === 0 && (
              <Box>
                <SelectionTabs
                  activePlayerIndex={activePlayerIndex}
                  setActivePlayerIndex={setActivePlayerIndex}
                  players={players}
                />

                {activePlayerIndex === 0 && (
                  <DefaultSelection
                    title="Default Leaders"
                    items={LEADERS}
                    selections={defaultLeaderSelections}
                    toggleSelection={toggleDefaultLeader}
                  />
                )}

                {activePlayerIndex > 0 && (
                  <PlayerSelection
                    activePlayerIndex={activePlayerIndex}
                    players={players}
                    items={LEADERS}
                    getSelectedItems={(player) => player.selectedLeaders}
                    handleSelection={handleLeaderSelection}
                  />
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <SelectionTabs
                  activePlayerIndex={activePlayerIndex}
                  setActivePlayerIndex={setActivePlayerIndex}
                  players={players}
                />

                {activePlayerIndex === 0 && (
                  <DefaultSelection
                    title="Default Civilizations"
                    items={CIVILIZATIONS}
                    selections={defaultCivSelections}
                    toggleSelection={toggleDefaultCiv}
                  />
                )}

                {activePlayerIndex > 0 && (
                  <PlayerSelection
                    activePlayerIndex={activePlayerIndex}
                    players={players}
                    items={CIVILIZATIONS}
                    getSelectedItems={(player) => player.selectedCivs}
                    handleSelection={handleCivSelection}
                  />
                )}
              </Box>
            )}
          </>
        </Stack>
      </div>
    </ThemeProvider>
  );
}

export default App;
