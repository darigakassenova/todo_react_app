import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const [sortState, setSortState] = useState(null);
  const [filterState, setFilterState] = useState(null);

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const [taskState, setTaskState] = useState("Not done");
  const taskDeadline = useRef("");

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState,
      deadline: taskDeadline.current.value,
    };

    setTasks([...tasks, newTask]);

    taskTitle.current.value = "";
    taskSummary.current.value = "";
    taskDeadline.current.value = ""
    setTaskState("Not done");
  }

  function deleteTask(index) {
    setTasks(tasks.filter((_, taskIndex) => taskIndex !== index));
  }

  function loadTasks() {
    const loadedTasks = localStorage.getItem("tasks");
   
    const tasks = JSON.parse(loadedTasks);
    
    if (tasks) {
      setTasks(tasks);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function sortTasksByState(state) {
    setTasks([...tasks].sort((a, b) => (a.state === state ? -1 : 1)));
  }

  function filterTasksByState(state) {
    return tasks.filter((task) => task.state === state);
  }

  function sortByDeadline() {
    setTasks([...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)));
  }

  function openEditModal(task, index) {
    setEditingTask({ ...task, index });
    setEditOpened(true);
  }

  function saveEditedTask() {
    const updatedTasks = [...tasks];
    updatedTasks[editingTask.index] = editingTask;
    setTasks(updatedTasks);
    setEditOpened(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={"New Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              data={["Done", "Not done", "Doing right now"]}
              value={taskState}
              onChange={setTaskState}
              label="State"
              placeholder="Select task state"
              mt={"md"}
            />
            <TextInput
              ref={taskDeadline}
              mt={"md"}
              type="date"
              placeholder="Deadline"
              label="Deadline"
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createTask();
                  setOpened(false);
                }}
              >
                Create Task
              </Button>
            </Group>
          </Modal>

          <Modal
            opened={editOpened}
            size={"md"}
            title={"Edit Task"}
            withCloseButton={false}
            onClose={() => setEditOpened(false)}
            centered
          >
            {editingTask && (
              <>
                <TextInput
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  placeholder={"Task Title"}
                  required
                  label={"Title"}
                />
                <TextInput
                  value={editingTask.summary}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, summary: e.target.value })
                  }
                  mt={"md"}
                  placeholder={"Task Summary"}
                  label={"Summary"}
                />
                <Select
                  data={["Done", "Not done", "Doing right now"]}
                  value={editingTask.state}
                  onChange={(value) => setEditingTask({ ...editingTask, state: value })}
                  label="State"
                  placeholder="Select task state"
                  mt={"md"}
                />
                <TextInput
                  ref={taskDeadline}
                  mt={"md"}
                  type="date"
                  placeholder="Deadline"
                  label="Deadline"
                />
                 <Group mt={"md"} position={"apart"}>
                  <Button onClick={() => setEditOpened(false)} variant={"subtle"}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveEditedTask()}>Save Changes</Button>
                </Group>
              </>
            )}
          </Modal>

          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>

            <Group mt="md" spacing="xs">
              <Button onClick={() => sortTasksByState("Done")}>Show Done First</Button>
              <Button onClick={() => sortTasksByState("Doing right now")}>Show Doing First</Button>
              <Button onClick={() => sortTasksByState("Not done")}>Show Not done First</Button>
              <Button onClick={() => sortByDeadline()}>Sort by Deadline</Button>
            </Group>

            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <ActionIcon
                      onClick={() => {
                        deleteTask(index);
                      }}
                      color={"red"}
                      variant={"transparent"}
                    >
                      <Trash />
                    </ActionIcon>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary was provided for this task"}
                  </Text>
                  <Text size={"sm"} mt={"xs"}>
                    <b>State:</b> {task.state}
                  </Text>
                  <Text size={"sm"} mt={"xs"}>
                    <b>Deadline:</b> {task.deadline || "No deadline provided"}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}

            <Button
              onClick={() => {
                setOpened(true);
              }}
              fullWidth
              mt={"md"}
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}