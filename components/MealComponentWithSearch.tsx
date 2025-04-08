import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Recipe = {
  id: number;
  saved_recipe_id: string;
  name: string;
  ingredients: string[];
  calories: string;
  carbs: string;
  fats: string;
  proteins: string;
};
type Meal = {
  name: string;
  ingredients: string[];
  calories: number;
  carbs: number;
  fats: number;
  protein: number;
};
const MealComponentWithSearch = ({
  meal,
  dayIndex,
  mealIndex,
  handleMealChange,
  savedRecipes,
}: {
  meal: Meal;
  dayIndex: number;
  mealIndex: number;
  handleMealChange: (mealIndex: number, updatedMeal: Partial<Meal>) => void;
  savedRecipes: Recipe[];
}) => {
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]); // Filtered recipes state
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // State to control dropdown visibility

  // Generate a unique key for this meal

  // Handle temporary changes to meal input
 

  // Get the tempMeal for this mealKey

  // Clear tempMeal after committing changes
  
  // Update filtered recipes based on the search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes([]);
      setIsDropdownVisible(false); // Hide dropdown if query is empty
    } else {
      const matches = savedRecipes.filter((recipe: { name: string }) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log(savedRecipes);
      
      const topMatches = matches.slice(0, 5); // Only take first 5 matches
  
      setFilteredRecipes(topMatches);
      setIsDropdownVisible(topMatches.length > 0); // Show dropdown only if matches found
    }
  }, [searchQuery, savedRecipes]);

  // Close dropdown on recipe click
  const handleRecipeSelect = (recipe: Recipe) => {
    // Convert SavedRecipe to Meal
    console.log(recipe.ingredients);
    
    const updatedMeal: Meal = {
      name: recipe.name,
      ingredients: recipe.ingredients,
      calories: parseInt(recipe.calories) || 0, // Convert string to number
      carbs: parseInt(recipe.carbs) || 0,
      fats: parseInt(recipe.fats) || 0,
      protein: parseInt(recipe.proteins) || 0,
    };
  
    handleMealChange(mealIndex, updatedMeal); // Now it's a Meal, so no type error
    setSearchQuery(""); // Clear the search input
    setIsDropdownVisible(false); // Hide the dropdown
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for saved recipes..."
          className="w-full font-semibold text-lg text-gray-800" // Improved font for input
        />

        {/* Dropdown for matching recipes */}
        {isDropdownVisible && filteredRecipes.length > 0 && (
          <div className="absolute z-10 bg-gray-50 border border-gray-300 rounded-lg shadow-lg mt-2 w-full max-h-48 overflow-y-auto">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={index}
                className="p-4 hover:bg-green-100 cursor-pointer flex justify-between items-center rounded-lg transition-all"
                onClick={() => handleRecipeSelect(recipe)}
              >
                <div className="text-gray-800 font-semibold text-md">{recipe.name}</div>
                <div className="text-gray-500 text-sm">
                  {/* Display calorie count */}
                  {recipe.calories ? `${recipe.calories} cal` : "Calories not available"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default MealComponentWithSearch;
