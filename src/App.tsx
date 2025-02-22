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

  const generateUniqueId = () => {
    let newId =
      players.length > 0
        ? Math.max(...players.map((player) => player.id)) + 1
        : 1;

    // Ensure the new ID is unique
    while (players.some((player) => player.id === newId)) {
      newId++;
    }

    return newId;
  };

  const addPlayer = () => {
    const newId = generateUniqueId(); // Call the unique ID generator

    const newPlayer = {
      id: newId,
      name: `Player ${newId}`,
      isEditing: false,
      selectedLeaders: LEADERS.filter(
        (_, index) => defaultLeaderSelections[index]
      ), // Use default selections
      selectedCivs: CIVILIZATIONS.filter(
        (_, index) => defaultCivSelections[index]
      ), // Use default selections
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
    setPlayers(
      players.map((player) => ({
        ...player,
        assignedLeaders: [],
        assignedCivs: [],
      }))
    );

    let success = false;
    let attempts = 0;

    while (!success && attempts < 100) {
      attempts++;
      const tempAssignments = new Map<
        number,
        { leaders: string[]; civs: string[] }
      >();
      const usedLeaders = new Set<string>();
      const usedCivs = new Set<string>();
      let valid = true;

      for (const player of players) {
        const availableLeaders = LEADERS.filter(
          (l) => player.selectedLeaders.includes(l) && !usedLeaders.has(l)
        );
        const availableCivs = CIVILIZATIONS.filter(
          (c) => player.selectedCivs.includes(c) && !usedCivs.has(c)
        );

        if (
          availableLeaders.length < leaderCount ||
          availableCivs.length < civCount
        ) {
          valid = false;
          break;
        }

        const selectedLeaders = [];
        const selectedCivs = [];

        for (let i = 0; i < leaderCount; i++) {
          const leader = availableLeaders.splice(
            Math.floor(Math.random() * availableLeaders.length),
            1
          )[0];
          selectedLeaders.push(leader);
          usedLeaders.add(leader);
        }

        for (let i = 0; i < civCount; i++) {
          const civ = availableCivs.splice(
            Math.floor(Math.random() * availableCivs.length),
            1
          )[0];
          selectedCivs.push(civ);
          usedCivs.add(civ);
        }

        tempAssignments.set(player.id, {
          leaders: selectedLeaders,
          civs: selectedCivs,
        });
      }

      if (valid) {
        setPlayers(
          players.map((player) => ({
            ...player,
            assignedLeaders: tempAssignments.get(player.id)?.leaders || [],
            assignedCivs: tempAssignments.get(player.id)?.civs || [],
          }))
        );
        success = true;
      }
    }

    if (!success) {
      alert(
        "Couldn't find valid combinations after 100 attempts. Try selecting more options or reducing the number of assignments!"
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
                <Tabs
                  value={activePlayerIndex}
                  onChange={(event, newValue) => setActivePlayerIndex(newValue)}
                >
                  <Tab label="Default" />
                  {players.map((player) => (
                    <Tab key={player.id} label={player.name} />
                  ))}
                </Tabs>

                {/* Default Leaders Section */}
                {activePlayerIndex === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" color="white">
                      Default Leaders:
                    </Typography>
                    <Grid2 container spacing={1}>
                      {LEADERS.map((leader, index) => (
                        <Grid2
                          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                          key={leader}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={defaultLeaderSelections[index]}
                                onChange={() => toggleDefaultLeader(index)}
                              />
                            }
                            label={leader}
                          />
                        </Grid2>
                      ))}
                    </Grid2>
                  </Box>
                )}

                {/* Leaders Section for Other Players */}
                {activePlayerIndex > 0 && (
                  <Box>
                    {players.map((player, i) => (
                      <div
                        key={player.id}
                        role="tabpanel"
                        hidden={activePlayerIndex !== i + 1}
                      >
                        {activePlayerIndex === i + 1 && (
                          <Box sx={{ p: 3 }}>
                            <Grid2 container spacing={1}>
                              {LEADERS.map((leader) => (
                                <Grid2
                                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                  key={leader}
                                >
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={player.selectedLeaders.includes(
                                          leader
                                        )}
                                        onChange={(e) =>
                                          handleLeaderSelection(
                                            player.id,
                                            leader,
                                            e.target.checked
                                          )
                                        }
                                      />
                                    }
                                    label={leader}
                                  />
                                </Grid2>
                              ))}
                            </Grid2>
                          </Box>
                        )}
                      </div>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* Civilizations Section */}
            {activeTab === 1 && (
              <Box>
                <Tabs
                  value={activePlayerIndex}
                  onChange={(event, newValue) => setActivePlayerIndex(newValue)}
                >
                  <Tab label="Default" />
                  {players.map((player) => (
                    <Tab key={player.id} label={player.name} />
                  ))}
                </Tabs>

                {/* Default Civilizations Section */}
                {activePlayerIndex === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" color="white">
                      Default Civilizations:
                    </Typography>
                    <Grid2 container spacing={1}>
                      {CIVILIZATIONS.map((civ, index) => (
                        <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={civ}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={defaultCivSelections[index]}
                                onChange={() => toggleDefaultCiv(index)}
                              />
                            }
                            label={civ}
                          />
                        </Grid2>
                      ))}
                    </Grid2>
                  </Box>
                )}

                {/* Civilizations Section for Other Players */}
                {activePlayerIndex > 0 && (
                  <Box>
                    {players.map((player, i) => (
                      <div
                        key={player.id}
                        role="tabpanel"
                        hidden={activePlayerIndex !== i + 1}
                      >
                        {activePlayerIndex === i + 1 && (
                          <Box sx={{ p: 3 }}>
                            <Grid2 container spacing={1}>
                              {CIVILIZATIONS.map((civ) => (
                                <Grid2
                                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                  key={civ}
                                >
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={player.selectedCivs.includes(
                                          civ
                                        )}
                                        onChange={(e) =>
                                          handleCivSelection(
                                            player.id,
                                            civ,
                                            e.target.checked
                                          )
                                        }
                                      />
                                    }
                                    label={civ}
                                  />
                                </Grid2>
                              ))}
                            </Grid2>
                          </Box>
                        )}
                      </div>
                    ))}
                  </Box>
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
