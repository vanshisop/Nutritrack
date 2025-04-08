import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// Define Meal type
type Meal = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: "quick" | "custom" | "saved";
  ingredients: string[];
};

// Props type for MealComponent
type MealComponentProps = {
  meal: Meal;
  dayIndex: number;
  mealIndex: number;
  handleMealChange: (mealIndex: number, updatedMeal: Partial<Meal>) => void;
};

const MealComponent: React.FC<MealComponentProps> = ({
  meal,
  dayIndex,
  mealIndex,
  handleMealChange,
}) => {
  const [tempMeals, setTempMeals] = useState<Record<string, Partial<Meal>>>({}); // Temp state for all custom meals

  // Generate a unique key for this meal
  const mealKey = `${dayIndex}-${mealIndex}`;

  // Handle temporary changes to meal input
  const handleInputChange = (key: keyof Meal, value: Meal[keyof Meal]) => {
    setTempMeals((prev) => ({
      ...prev,
      [mealKey]: {
        ...(prev[mealKey] || {}), // Initialize as empty if not already set
        [key]: value,
      },
    }));
  };

  // Get the tempMeal for this mealKey
  const tempMeal = tempMeals[mealKey] || {};

  // Clear tempMeal after committing changes
  const handleUpdate = () => {
    const updatedMeal: Meal = {
      name: tempMeal.name ?? "",
      calories: tempMeal.calories ?? 0,
      protein: tempMeal.protein ?? 0,
      fats: tempMeal.fats ?? 0,
      carbs: tempMeal.carbs ?? 0,
      ingredients: tempMeal.ingredients ?? [],
      type: "custom", // Assuming custom type for temp meals
    };
    handleMealChange(mealIndex, updatedMeal);

    // Instead of setting the meal to undefined, remove it entirely from the state
    setTempMeals((prev) => {
      const newState = { ...prev };
      delete newState[mealKey]; // Remove the specific meal key
      return newState;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Meal Name Input */}
        <Input
          value={tempMeal.name ?? ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder={`Enter Meal ${mealIndex + 1} name`}
          className="flex-grow"
        />

        {/* Calories Input */}
        <Input
          type="number"
          value={tempMeal.calories ?? ""}
          onChange={(e) => handleInputChange("calories", parseInt(e.target.value) || 0)}
          placeholder="Calories"
          className="w-24"
        />
      </div>

      <div className="flex items-center space-x-4">
        {/* Protein Input */}
        <Input
          type="number"
          value={tempMeal.protein ?? ""}
          onChange={(e) => handleInputChange("protein", parseInt(e.target.value) || 0)}
          placeholder="Protein (gm)"
          className="w-24"
        />

        {/* Fats Input */}
        <Input
          type="number"
          value={tempMeal.fats ?? ""}
          onChange={(e) => handleInputChange("fats", parseInt(e.target.value) || 0)}
          placeholder="Fats (gm)"
          className="w-24"
        />

        {/* Carbs Input */}
        <Input
          type="number"
          value={tempMeal.carbs ?? ""}
          onChange={(e) => handleInputChange("carbs", parseInt(e.target.value) || 0)}
          placeholder="Carbs (gm)"
          className="w-24"
        />
      </div>

      {/* Ingredients Input */}
      <Textarea
        value={(tempMeal.ingredients ?? []).join(", ")}
        onChange={(e) => handleInputChange("ingredients", e.target.value.split(", "))}
        placeholder="Enter ingredients (comma-separated)"
        className="w-full"
      />

      {/* Update Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                onClick={handleUpdate}
                className="mt-2"
                disabled={!tempMeal.name || tempMeal.name.trim() === ""}
              >
                Update Current Selection
              </Button>
            </span>
          </TooltipTrigger>
          {!tempMeal.name || tempMeal.name.trim() === "" ? (
            <TooltipContent>
              Please enter the name before updating.
            </TooltipContent>
          ) : null}
        </Tooltip>
      </TooltipProvider>

      {/* Current Selection Card */}
      {meal.name || meal.calories > 0 || (meal.ingredients && meal.ingredients.length > 0) ? (
        <Card className="bg-[#f0f7f4] shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <CardContent className="p-6">
            <h4 className="font-semibold text-xl text-green-800 mb-3 border-b border-gray-300 pb-2">
              🍽️ Current Selection
            </h4>
            <div className="text-gray-700">
              <p className="text-lg font-medium mb-2">
                {meal.name ? (
                  <>
                    <span className="font-bold text-gray-800">Name:</span> {meal.name}
                  </>
                ) : (
                  <span className="text-gray-500">No name set</span>
                )}
              </p>

              <p className="text-lg font-medium mb-2">
                <span className="font-bold text-green-600">Calories:</span> {meal.calories || "Not specified"}
              </p>

              <p className="text-lg font-medium mb-2">
                <span className="font-bold text-purple-600">Protein:</span> {meal.protein + " gm" || "Not specified"} | 
                <span className="font-bold text-yellow-600 ml-2">Fats:</span> {meal.fats + " gm" || "Not specified"} | 
                <span className="font-bold text-red-600 ml-2">Carbs:</span> {meal.carbs + " gm" || "Not specified"}
              </p>

              <p className="text-lg font-medium">
                <span className="font-bold text-blue-500">Ingredients:</span>{" "}
                {meal.ingredients && meal.ingredients.length > 0 ? (
                  <span className="text-gray-600">{meal.ingredients.join(", ")}</span>
                ) : (
                  <span className="text-gray-400">No ingredients added</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default MealComponent;
