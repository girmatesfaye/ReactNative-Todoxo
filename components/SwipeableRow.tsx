import React, { useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Todo } from "../utils/interfaces";
import { Text } from "react-native";

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
  onToggle: () => void;
  todo: Todo;
}

export default function SwipeableRow({
  children,
  onDelete,
  onToggle,
  todo,
}: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    // Both actions together on the right side
    const trans = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: 160 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <RectButton
              style={[
                styles.actionButton,
                { backgroundColor: todo.is_complete ? "#ff9500" : "#34c759" },
              ]}
              onPress={() => {
                swipeableRef.current?.close();
                onToggle();
              }}
            >
              <Ionicons
                name={
                  todo.is_complete
                    ? "arrow-undo-outline"
                    : "checkmark-done-outline"
                }
                size={24}
                color="white"
              />
              <Text style={styles.actionText}>
                {todo.is_complete ? "Undo" : "Done"}
              </Text>
            </RectButton>
            <RectButton
              style={[styles.actionButton, { backgroundColor: "#ff4444" }]}
              onPress={() => {
                swipeableRef.current?.close();
                onDelete();
              }}
            >
              <Ionicons name="trash-outline" size={24} color="white" />
              <Text style={styles.actionText}>Delete</Text>
            </RectButton>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    // Hide left actions for completed todos as requested ("left swipe only")
    if (todo.is_complete) return null;

    const trans = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: 80 }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
          <RectButton
            style={[styles.actionButton, { backgroundColor: "#34c759" }]}
            onPress={() => {
              swipeableRef.current?.close();
              onToggle();
            }}
          >
            <Ionicons name="checkmark-done-outline" size={24} color="white" />
            <Text style={styles.actionText}>Done</Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={30}
      rightThreshold={40}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
});
