"use client"
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";

import SuccessDialog from "./SuccessDialog";

type Meal = {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  type: "quick" | "custom" | "saved"
  ingredients: string[]
};

type DailyPlan = {
  date: string;
  meals: Meal[];
};

const MealPlanDialog = ({ isDialogOpen, setIsDialogOpen, weeklyPlan, userID,setInitialLoad }:{ isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void; weeklyPlan: DailyPlan[]  ; userID : number ; setInitialLoad: (val: boolean) => void;}) => {
  console.log(weeklyPlan);
  
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentDay = daysOfWeek[new Date().getDay() - 1] || "Monday"; // Default to Monday if index is -1
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Your meals from the meal plan have been successfully added");
  // Get the index of the selected day
  const selectedDayIndex = daysOfWeek.indexOf(selectedDay);

  // Get meals for the selected day (assuming it's an array of meal objects)
  const dailyMeals = weeklyPlan[selectedDayIndex] || [];

  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  
  
  const handleCloseSuccessDialog = () => {
    setIsSuccessDialogOpen(false); // Close the dialog
  };
  const handleAddFood = async () => {
    const mealsToSubmit = selectedMeals.map((meal:Meal) => ({
      id: userID,
      date: formatDate(new Date()),
      name: meal.name,
      ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.join(", ") : meal.ingredients,
      calories: meal.calories,
      servings: 1,
      fats: meal.fats || 1,
      proteins: meal.protein || 1,
      carbs: meal.carbs || 1,
    }));

    for (const meal of mealsToSubmit) {
      try {
        await axios.post("https://express-vercel-nutritrack.vercel.app/add-food", meal, { withCredentials: true });

      } catch (error) {
        console.error("Error adding food:", error);
      }
    }
    console.log("??");
    setIsSuccessDialogOpen(true)
    setIsDialogOpen(false)
    setSelectedMeals([])
    setInitialLoad(true)
    
    
  };

  const handleMealSelection = (meal:Meal) => {
    setSelectedMeals((prevMeals) =>
      prevMeals.some((m) => m.name === meal.name)
        ? prevMeals.filter((m) => m.name !== meal.name) // Deselect meal
        : [...prevMeals, meal] // Select meal
    );
  };

  return (
    <div>
    <SuccessDialog
        open={isSuccessDialogOpen}
        onClose={handleCloseSuccessDialog}
        message={successMessage}
    />
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] p-4 flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">Meal Plan Selection</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Choose the day of the week and select the meals you had.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="space-y-4 flex-grow overflow-y-auto">
          {/* Day Picker */}
          <div>
            <label htmlFor="meal-plan-day" className="block text-sm font-medium text-gray-700">
              What day is this meal plan for?
            </label>
            <select
              id="meal-plan-day"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Meal Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meals for {selectedDay}:
            </label>
            {dailyMeals.meals.length > 0 ? (
              <div className="mt-2 space-y-4">
                {dailyMeals.meals.map((meal) => {
                  const isSelected = selectedMeals.some((m:Meal) => m.name === meal.name);

                  return (
                    <div key={meal.name} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{meal.name}</span>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={isSelected}
                          onChange={() => handleMealSelection(meal)}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Calories:</strong> {meal.calories}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Proteins:</strong> {meal.protein || "N/A"}g
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Carbs:</strong> {meal.carbs || "N/A"}g
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Fats:</strong> {meal.fats || "N/A"}g
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Ingredients:</strong> {meal.ingredients?.length ? meal.ingredients.join(", ") : "N/A"}
                      </p>
                    </div>
                  );
                  
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No meals available for this day.</p>
            )}
          </div>
        </div>

        {/* Fixed Submit Button */}
        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button onClick={() => setIsDialogOpen(false)} className="bg-gray-500 hover:bg-gray-600">
            Cancel
          </Button>
          <Button
            onClick={handleAddFood}
            className={`bg-blue-500 hover:bg-blue-600 ${
              selectedMeals.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={selectedMeals.length === 0}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default MealPlanDialog;
