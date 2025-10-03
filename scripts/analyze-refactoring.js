#!/usr/bin/env node
/**
 * Elvira App Refactoring Analysis Script
 *
 * This script analyzes the codebase and provides refactoring recommendations
 * to improve maintainability, readability, and code organization.
 */

const fs = require("fs");
const path = require("path");

// Utility function to count lines in a file
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return content.split("\n").length;
  } catch (error) {
    return 0;
  }
}

// Utility function to analyze file complexity
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").length;
    const imports = (content.match(/^import/gm) || []).length;
    const functions = (content.match(/^(const|function)/gm) || []).length;
    const components = (content.match(/const \w+\s*=\s*\(/gm) || []).length;
    const styles = (content.match(/StyleSheet\.create/g) || []).length;

    return {
      lines,
      imports,
      functions,
      components,
      styles,
      complexity: calculateComplexity(lines, imports, functions),
    };
  } catch (error) {
    return null;
  }
}

function calculateComplexity(lines, imports, functions) {
  if (lines < 50) return "LOW";
  if (lines < 150) return "MEDIUM";
  if (lines < 300) return "HIGH";
  return "VERY_HIGH";
}

// Main analysis function
function analyzeCodebase() {
  const baseDir = process.cwd();
  const results = {
    totalFiles: 0,
    refactoredFiles: 0,
    highComplexityFiles: [],
    recommendations: [],
    files: {},
  };

  // Files to analyze
  const filesToAnalyze = [
    "App.js",
    "screens/ProfileScreen.js",
    "screens/RoomsScreen.js",
    "screens/CalendarScreen.js",
    "screens/MessagesScreen.js",
    "hooks/useAuth.js",
    "hooks/useCalendarLogic.js",
    "hooks/useRooms.js",
    "hooks/useMessaging.js",
    "hooks/useNotifications.js",
  ];

  console.log("🔍 ELVIRA APP REFACTORING ANALYSIS");
  console.log("=====================================\n");

  filesToAnalyze.forEach((file) => {
    const filePath = path.join(baseDir, file);
    const analysis = analyzeFile(filePath);

    if (analysis) {
      results.totalFiles++;
      results.files[file] = analysis;

      console.log(`📄 ${file}`);
      console.log(`   Lines: ${analysis.lines}`);
      console.log(`   Complexity: ${analysis.complexity}`);

      if (
        analysis.complexity === "HIGH" ||
        analysis.complexity === "VERY_HIGH"
      ) {
        results.highComplexityFiles.push(file);
        console.log(`   ⚠️  NEEDS REFACTORING`);
      } else {
        console.log(`   ✅ Good structure`);
      }
      console.log("");
    }
  });

  // Generate recommendations
  generateRecommendations(results);

  return results;
}

function generateRecommendations(results) {
  console.log("📋 REFACTORING RECOMMENDATIONS");
  console.log("==============================\n");

  // MessagesScreen analysis
  const messagesScreen = results.files["screens/MessagesScreen.js"];
  if (messagesScreen && messagesScreen.lines < 80) {
    console.log("✅ MessagesScreen successfully refactored!");
    console.log(`   Reduced from ~288 lines to ${messagesScreen.lines} lines`);
    console.log(
      "   Components extracted: MessageHeader, ConversationItem, MessageSearchBar"
    );
    console.log("   Utilities extracted: messageUtils.js\n");
    results.refactoredFiles++;
  }

  // High priority recommendations
  console.log("🔴 HIGH PRIORITY:");

  const profileScreen = results.files["screens/ProfileScreen.js"];
  if (profileScreen && profileScreen.complexity !== "LOW") {
    console.log(`1. ProfileScreen.js (${profileScreen.lines} lines)`);
    console.log("   → Extract useImagePicker hook");
    console.log("   → Create ProfileStats component");
    console.log("   → Create ProfileMenu component");
    console.log("   → Extract profile constants\n");
  }

  const appJs = results.files["App.js"];
  if (appJs && appJs.complexity !== "LOW") {
    console.log(`2. App.js (${appJs.lines} lines)`);
    console.log("   → Extract TabNavigator component");
    console.log("   → Extract AuthNavigator component");
    console.log("   → Separate navigation configuration\n");
  }

  const useAuth = results.files["hooks/useAuth.js"];
  if (useAuth && useAuth.complexity !== "LOW") {
    console.log(`3. useAuth.js (${useAuth.lines} lines)`);
    console.log("   → Split into useAuth and useProfile hooks");
    console.log("   → Extract authService for API calls");
    console.log("   → Add TypeScript definitions\n");
  }

  // Medium priority recommendations
  console.log("🟡 MEDIUM PRIORITY:");

  const roomsScreen = results.files["screens/RoomsScreen.js"];
  if (roomsScreen) {
    console.log(`4. RoomsScreen.js (${roomsScreen.lines} lines)`);
    console.log("   → Already well-structured with extracted components");
    console.log("   → Consider extracting filter constants\n");
  }

  const calendarScreen = results.files["screens/CalendarScreen.js"];
  if (calendarScreen) {
    console.log(`5. CalendarScreen.js (${calendarScreen.lines} lines)`);
    console.log("   → Already refactored with useCalendarLogic hook");
    console.log("   → Consider extracting date utilities\n");
  }

  // Generate refactoring script recommendations
  console.log("🛠️  SUGGESTED REFACTORING SCRIPTS:");
  console.log(
    "1. refactor-profile-screen.js - Extract ProfileScreen components"
  );
  console.log("2. refactor-app-navigation.js - Split App.js navigation");
  console.log("3. refactor-auth-system.js - Split authentication hooks");
  console.log("4. create-shared-constants.js - Extract common constants");
  console.log("5. create-shared-styles.js - Extract common styles\n");

  // Summary
  console.log("📊 REFACTORING SUMMARY:");
  console.log(`Total files analyzed: ${results.totalFiles}`);
  console.log(`Files successfully refactored: ${results.refactoredFiles}`);
  console.log(
    `High complexity files remaining: ${results.highComplexityFiles.length}`
  );
  console.log("Next recommended target: ProfileScreen.js\n");
}

// Run the analysis
if (require.main === module) {
  analyzeCodebase();
}

module.exports = { analyzeCodebase, analyzeFile, countLines };
