import {
  View,
  Text,
  TextInput,
  Button,
  ListRenderItem,
  FlatList,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { Todo } from "@/utils/interfaces";
import { Ionicons } from "@expo/vector-icons";
import SwipeableRow from "@/components/SwipeableRow";

export default function Page() {
  const [todo, setTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    loadsTodos();
  }, []);

  const addTodo = async () => {
    const trimmedTask = todo.trim();
    if (trimmedTask.length < 3) {
      Alert.alert("Error", "Task must be at least 3 characters long");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "You must be logged in to add a todo");
        return;
      }

      const { data, error } = await supabase.from("todos").insert({
        user_id: user.id,
        task: trimmedTask,
      }).select().single();

      if (error) {
        if (error.code === "23514") {
          Alert.alert(
            "Validation Error",
            "The task does not meet the database requirements (it might be too short or contains invalid characters).",
          );
        } else {
          Alert.alert("Error", error.message);
        }
      } else if (data) {
        setTodos((prev) => [data, ...prev]);
        setTodo("");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadsTodos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("inserted_at", { ascending: false });

      if (error) {
        Alert.alert("Error loading todos", error.message);
      } else {
        setTodos(data || []);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onToggle = async (todo: Todo) => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .update({ is_complete: !todo.is_complete })
        .eq("id", todo.id)
        .select()
        .single();

      if (error) {
        Alert.alert("Error updating todo", error.message);
      } else if (data) {
        setTodos((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const onDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) {
        Alert.alert("Error deleting todo", error.message);
      } else {
        setTodos((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const renderItem: ListRenderItem<Todo> = ({ item }) => {
    return (
      <SwipeableRow
        todo={item}
        onDelete={() => onDelete(item.id)}
        onToggle={() => onToggle(item)}
      >
        <View
          style={{
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
          }}
        >
          <Pressable onPress={() => onToggle(item)}>
            <Ionicons
              name={item.is_complete ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={item.is_complete ? "#048433" : "#ccc"}
            />
          </Pressable>
          <Text
            style={{
              fontSize: 16,
              color: item.is_complete ? "#888" : "black",
              flex: 1,
              marginLeft: 10,
              textDecorationLine: item.is_complete ? "line-through" : "none",
            }}
          >
            {item.task}
          </Text>
        </View>
      </SwipeableRow>
    );
  };
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TextInput
          value={todo}
          onChangeText={setTodo}
          placeholder="Enter a todo"
          style={{
            flex: 1,
            marginRight: 10,
            backgroundColor: "white",
            color: "black",
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            paddingHorizontal: 10,
          }}
        />
        <Button
          title="Add Todo"
          onPress={addTodo}
          disabled={loading || todo.trim().length < 3}
          color="#048433"
        />
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}
