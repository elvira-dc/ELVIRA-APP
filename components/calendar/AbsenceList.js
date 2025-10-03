import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export const AbsenceList = ({
  absenceRequests,
  absenceLoading,
  formatRequestType,
  getAbsenceStatusColor,
  onAbsencePress,
}) => {
  if (absenceLoading) {
    return (
      <View style={styles.loadingState}>
        <Text style={styles.loadingText}>Loading absence requests...</Text>
      </View>
    );
  }

  if (absenceRequests.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No absence requests</Text>
        <Text style={styles.emptyStateSubtext}>
          Your absence requests will appear here
        </Text>
      </View>
    );
  }

  return (
    <>
      {absenceRequests.map((request) => (
        <TouchableOpacity
          key={request.id}
          style={styles.absenceCard}
          onPress={() => onAbsencePress?.(request)}
          activeOpacity={0.7}
        >
          <View style={styles.absenceHeader}>
            <View style={styles.absenceTypeContainer}>
              <View
                style={[
                  styles.absenceTypeIndicator,
                  { backgroundColor: getAbsenceStatusColor(request.status) },
                ]}
              />
              <Text style={styles.absenceType}>
                {formatRequestType(request.request_type)}
              </Text>
            </View>
            <View style={styles.absenceStatusContainer}>
              <Text
                style={[
                  styles.absenceStatus,
                  { color: getAbsenceStatusColor(request.status) },
                ]}
              >
                {request.status.charAt(0).toUpperCase() +
                  request.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.absenceDates}>
            {(() => {
              const startDate = new Date(request.start_date);
              const endDate = new Date(request.end_date);
              const formatDate = (date) =>
                date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

              if (startDate.toDateString() === endDate.toDateString()) {
                return formatDate(startDate);
              } else {
                return `${formatDate(startDate)} - ${formatDate(endDate)}`;
              }
            })()}
          </Text>
          {request.notes && (
            <Text style={styles.absenceNotes}>{request.notes}</Text>
          )}
        </TouchableOpacity>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  absenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  absenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  absenceTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  absenceTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  absenceType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#484848",
  },
  absenceStatusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
  },
  absenceStatus: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  absenceDates: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 4,
  },
  absenceNotes: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  loadingState: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8E8E93",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#C7C7CC",
  },
});
